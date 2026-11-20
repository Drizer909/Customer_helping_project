"""Generate the public help center from the support agent's customer guides."""
import html
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
articles = []
for guide in sorted((root / "support-agent/knowledge_docs").glob("*.md")):
    title, body = guide.read_text().split("\n", 1)
    sections = []
    for block in re.split(r"\n\s*\n", body.strip()):
        items = []
        for line in block.splitlines():
            safe = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", html.escape(line))
            if safe.startswith("## "):
                sections.append(f"<h3>{safe[3:]}</h3>")
            elif line.startswith("- ") or re.match(r"\d+\. ", line):
                items.append("<li>" + re.sub(r"^(?:- |\d+\. )", "", safe) + "</li>")
            else:
                sections.append(f"<p>{safe}</p>")
        if items:
            tag = "ol" if re.search(r"^\d+\. ", block, re.M) else "ul"
            sections.append(f"<{tag}>" + "".join(items) + f"</{tag}>")
    articles.append("<article><h2>" + html.escape(title.removeprefix("# ")) +
                    "</h2>" + "".join(sections) + "</article>")

out = root / "docs"
out.mkdir(exist_ok=True)
template = (root / "public-help/template.html").read_text()
(out / "index.html").write_text(template.replace("<!-- guides -->", "\n".join(articles)))
