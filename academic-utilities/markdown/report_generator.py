import os
import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass

@dataclass
class ReportConfig:
    title: str
    author: str
    date: str = None
    institution: str = ""
    abstract: str = ""
    toc_depth: int = 3
    highlight_style: str = "github"
    code_fence: str = "```"

class MarkdownReportGenerator:
    def __init__(self, config: ReportConfig):
        self.config = config
        self.sections = []
        self.toc_entries = []
        self.figures = []
        self.tables = []

    def add_heading(self, text: str, level: int = 1):
        prefix = '#' * level
        self.sections.append(f"\n{prefix} {text}\n")
        
        if level <= self.config.toc_depth:
            indent = '  ' * (level - 1)
            anchor = self._create_anchor(text)
            self.toc_entries.append(f"{indent}- [{text}](#{anchor})")

    def add_paragraph(self, text: str):
        self.sections.append(f"\n{text}\n")

    def add_bold_text(self, text: str) -> str:
        return f"**{text}**"

    def add_italic_text(self, text: str) -> str:
        return f"*{text}*"

    def add_code_block(self, code: str, language: str = ""):
        fence = self.config.code_fence
        return f"\n{fence}{language}\n{code}\n{fence}\n"

    def add_inline_code(self, code: str) -> str:
        return f"`{code}`"

    def add_list(self, items: List[str], ordered: bool = False):
        list_items = []
        for i, item in enumerate(items):
            prefix = f"{i+1}." if ordered else "-"
            list_items.append(f"{prefix} {item}")
        
        self.sections.append("\n" + "\n".join(list_items) + "\n")

    def add_image(self, src: str, alt: str, title: Optional[str] = None):
        img_tag = f"![{alt}]({src}"
        if title:
            img_tag += f' "{title}"'
        img_tag += ")"
        
        self.sections.append(f"\n{img_tag}\n")
        
        figure_num = len(self.figures) + 1
        self.figures.append({
            'number': figure_num,
            'src': src,
            'alt': alt,
            'title': title or alt
        })
        
        return f"Figure {figure_num}: {title or alt}"

    def add_table(self, headers: List[str], rows: List[List[str]], align: List[str] = None):
        if align is None:
            align = ['left'] * len(headers)
        
        align_map = {'left': ':---', 'center': ':---:', 'right': '---:'}
        
        header_row = "| " + " | ".join(headers) + " |"
        separator = "| " + " | ".join([align_map[a] for a in align]) + " |"
        
        table_rows = []
        for row in rows:
            table_rows.append("| " + " | ".join(str(cell) for cell in row) + " |")
        
        table_md = "\n" + header_row + "\n" + separator + "\n"
        table_md += "\n".join(table_rows) + "\n"
        
        self.sections.append(table_md)
        
        table_num = len(self.tables) + 1
        self.tables.append({
            'number': table_num,
            'headers': headers,
            'rows': rows
        })
        
        return f"Table {table_num}"

    def add_blockquote(self, text: str):
        lines = text.split('\n')
        quoted = '\n'.join([f"> {line}" for line in lines])
        self.sections.append(f"\n{quoted}\n")

    def add_horizontal_rule(self):
        self.sections.append("\n---\n")

    def add_link(self, text: str, url: str):
        return f"[{text}]({url})"

    def generate_toc(self) -> str:
        if not self.toc_entries:
            return ""
        
        toc = ["\n## Table of Contents\n"]
        toc.extend(self.toc_entries)
        return "\n".join(toc)

    def generate_figure_list(self) -> str:
        if not self.figures:
            return ""
        
        lines = ["\n## List of Figures\n"]
        for fig in self.figures:
            lines.append(f"{fig['number']}. {fig['title']}")
        
        return "\n".join(lines)

    def generate_table_list(self) -> str:
        if not self.tables:
            return ""
        
        lines = ["\n## List of Tables\n"]
        for table in self.tables:
            lines.append(f"{table['number']}. {table['headers']}")
        
        return "\n".join(lines)

    def generate_document(self) -> str:
        date = self.config.date or datetime.now().strftime("%B %d, %Y")
        
        document = [
            "---",
            f"title: {self.config.title}",
            f"author: {self.config.author}",
            f"date: {date}",
            f"institution: {self.config.institution}",
            "---",
            "",
            f"# {self.config.title}",
            "",
            f"**Author:** {self.config.author}",
        ]
        
        if self.config.institution:
            document.append(f"**Institution:** {self.config.institution}")
        
        document.append(f"**Date:** {date}")
        
        if self.config.abstract:
            document.extend([
                "",
                "## Abstract",
                self.config.abstract
            ])
        
        document.append(self.generate_toc())
        document.extend(self.sections)
        document.append(self.generate_figure_list())
        document.append(self.generate_table_list())
        
        return "\n".join(document)

    def _create_anchor(self, text: str) -> str:
        anchor = text.lower()
        anchor = re.sub(r'[^\w\s-]', '', anchor)
        anchor = re.sub(r'[\s_-]+', '-', anchor)
        anchor = anchor.strip('-')
        return anchor

    def save(self, path: str):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(self.generate_document())

class AcademicReportGenerator(MarkdownReportGenerator):
    def __init__(self, title: str, author: str, **kwargs):
        super().__init__(ReportConfig(title=title, author=author, **kwargs))

    def add_chapter(self, title: str, content: str):
        self.add_heading(title, 1)
        self.add_paragraph(content)

    def add_section(self, title: str, content: str):
        self.add_heading(title, 2)
        self.add_paragraph(content)

    def add_subsection(self, title: str, content: str):
        self.add_heading(title, 3)
        self.add_paragraph(content)

    def add_equation(self, latex: str, label: str = None):
        eq = f"\n$${latex}$$\n"
        self.sections.append(eq)
        
        if label:
            self.sections.append(f"*{label}*\n")

    def add_reference(self, citation_key: str):
        return f"[{citation_key}](#{citation_key})"

    def add_bibliography_entry(self, key: str, entry: Dict[str, str]):
        lines = [f"**[{key}]**"]
        
        if 'author' in entry:
            lines.append(f"Authors: {entry['author']}")
        if 'title' in entry:
            lines.append(f"Title: *{entry['title']}*")
        if 'year' in entry:
            lines.append(f"Year: {entry['year']}")
        if 'journal' in entry:
            lines.append(f"Journal: {entry['journal']}")
        if 'volume' in entry:
            lines.append(f"Volume: {entry['volume']}")
        if 'pages' in entry:
            lines.append(f"Pages: {entry['pages']}")
        
        self.sections.append("\n".join(lines) + "\n")

class TechnicalReportGenerator(MarkdownReportGenerator):
    def add_code_example(self, title: str, code: str, language: str = "python"):
        self.add_heading(title, 3)
        self.sections.append(self.add_code_block(code, language))

    def add_api_endpoint(self, method: str, path: str, description: str = ""):
        badge = f"`{method.upper()}`"
        self.add_paragraph(f"{badge} `{path}`")
        if description:
            self.add_paragraph(description)

    def add_warning(self, text: str):
        self.add_blockquote(f"⚠️ **Warning:** {text}")

    def add_info(self, text: str):
        self.add_blockquote(f"ℹ️ **Info:** {text}")

    def add_tip(self, text: str):
        self.add_blockquote(f"💡 **Tip:** {text}")

def create_report(template: str = 'academic', **kwargs) -> MarkdownReportGenerator:
    if template == 'academic':
        return AcademicReportGenerator(**kwargs)
    elif template == 'technical':
        return TechnicalReportGenerator(**kwargs)
    else:
        config = ReportConfig(**kwargs)
        return MarkdownReportGenerator(config)