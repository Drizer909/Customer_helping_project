import chromadb
from chromadb.config import Settings as ChromaSettings
from fastembed import TextEmbedding
import google.generativeai as genai
from app.config import settings
from typing import List, Tuple
import time

class RAGEngine:
    def __init__(self):
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        self.collection = self.chroma_client.get_or_create_collection(name="knowledge_base")
        
        # Initialize FastEmbed
        try:
            self.embedding_model = TextEmbedding(model_name=settings.embedding_model)
            self.use_fastembed = True
        except Exception as e:
            print(f"Warning: FastEmbed failed to initialize: {e}")
            self.use_fastembed = False
        
        # Initialize Gemini
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)

    def generate_embedding(self, text: str) -> List[float]:
        if self.use_fastembed:
            # FastEmbed returns a generator, we take the first item
            embeddings = list(self.embedding_model.embed([text]))
            return embeddings[0].tolist()
        else:
            # Fallback dummy embedding (384 dimensions for all-MiniLM-L6-v2)
            return [0.0] * 384

    def search_knowledge_base(self, query: str, top_k: int = 3) -> List[dict]:
        query_embedding = self.generate_embedding(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        docs = []
        if results['documents']:
            for i, doc_content in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i]
                docs.append({
                    "title": metadata.get("title", "Untitled"),
                    "content": doc_content,
                    "score": results['distances'][0][i] if 'distances' in results else 0.0
                })
        return docs

    def build_prompt(self, query: str, context_docs: List[dict]) -> str:
        context_str = ""
        for doc in context_docs:
            context_str += f"Document: {doc['title']}\nContent: {doc['content']}\n\n"
            
        prompt = f"""You are "SupportAI", an expert customer service agent. Answer using ONLY the provided knowledge base context.

<context>
{context_str}
</context>

User Query: {query}

Instructions:
1. If answer exists in context, provide it concisely with confidence score 0.9-1.0
2. If answer is partially available, state what's known and what's not with confidence 0.5-0.8
3. If no relevant information, respond: "ESCALATE: [brief reason]" with confidence 0.0-0.3
4. Never mention "context" or "documents" to user
5. Keep responses under 200 words
6. Format: RESPONSE|CONFIDENCE_SCORE
"""
        return prompt

    def generate_response(self, query: str) -> Tuple[str, List[str], float]:
        context_docs = self.search_knowledge_base(query, top_k=settings.max_context_docs)
        prompt = self.build_prompt(query, context_docs)
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Parse response and confidence score
            if "|" in response_text:
                parts = response_text.rsplit("|", 1)
                answer = parts[0].strip()
                try:
                    confidence = float(parts[1].strip())
                except ValueError:
                    confidence = 0.5
            else:
                answer = response_text
                confidence = 0.5 # Default if format is missed
                
            sources = [doc['title'] for doc in context_docs]
            return answer, sources, confidence
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later.", [], 0.0

rag_engine = RAGEngine()
