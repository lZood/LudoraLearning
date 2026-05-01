"""Generate carta de recomendación laboral PDF for José Carlos Ramírez López.

Diseño inspirado en la landing de LudoraLearning:
- Paleta: morado de marca + crema #f5f1e4 + texto oscuro #1a1a1a
- Display: Helvetica-Bold con tracking amplio (NeueMachina no es compatible con reportlab)
- Composición moderna con barra de marca y acentos sutiles
- Fondo blanco
- Diseñado para caber en una sola página carta
"""
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image as RLImage,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT = Path("Carta_Recomendacion_Jose_Carlos_Ramirez.pdf")
LOGO_SRC = Path(r"C:/Users/José Carlos/Pictures/logoLudora.png")
FIRMA_SRC = Path(r"C:/Users/José Carlos/Downloads/FirmaValeria.png")
LOGO_PNG = Path("_logo_tmp.png")
FIRMA_PNG = Path("_firma_tmp.png")

# Brand palette (matches landing)
PURPLE = HexColor("#6B2BB8")
PURPLE_DARK = HexColor("#4A1B85")
DARK = HexColor("#1A1A1A")
GRAY = HexColor("#5B5B6B")
CREAM = HexColor("#F5F1E4")

# Normalize the logo (force RGBA PNG)
Image.open(LOGO_SRC).convert("RGBA").save(LOGO_PNG, "PNG")
# Normalize the signature (RGBA, fit reasonable width)
firma_img = Image.open(FIRMA_SRC).convert("RGBA")
firma_img.save(FIRMA_PNG, "PNG")
firma_w, firma_h = firma_img.size
firma_ratio = firma_h / firma_w

doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=LETTER,
    leftMargin=1.8 * cm,
    rightMargin=1.8 * cm,
    topMargin=0,           # we draw a custom branded band at the top
    bottomMargin=1.0 * cm,
    title="Carta de Recomendación - José Carlos Ramírez López",
    author="LudoraLearning",
)

# Page width usable for content
USABLE_W = LETTER[0] - 1.8 * cm * 2  # ~17.6 cm

styles = getSampleStyleSheet()

style_brand = ParagraphStyle(
    "Brand", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=18, leading=20, textColor=white, alignment=TA_LEFT,
)
style_brand_sub = ParagraphStyle(
    "BrandSub", parent=styles["Normal"], fontName="Helvetica",
    fontSize=8.5, leading=11, textColor=HexColor("#E8E0F8"), alignment=TA_LEFT,
)
style_meta = ParagraphStyle(
    "Meta", parent=styles["Normal"], fontName="Helvetica",
    fontSize=8.5, leading=11, textColor=HexColor("#E8E0F8"), alignment="RIGHT",
)
style_date = ParagraphStyle(
    "Date", parent=styles["Normal"], fontName="Helvetica",
    fontSize=9.5, leading=12, textColor=GRAY, alignment=TA_LEFT,
)
style_eyebrow = ParagraphStyle(
    "Eyebrow", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=8.5, leading=10, textColor=PURPLE, alignment=TA_CENTER,
)
style_title = ParagraphStyle(
    "Title", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=20, leading=22, textColor=DARK, alignment=TA_CENTER,
    spaceBefore=2, spaceAfter=10,
)
style_addr = ParagraphStyle(
    "Addr", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=10, leading=12, textColor=DARK, spaceAfter=6,
)
style_body = ParagraphStyle(
    "Body", parent=styles["Normal"], fontName="Helvetica",
    fontSize=9.5, leading=12.5, textColor=DARK, alignment=TA_JUSTIFY,
    spaceAfter=5,
)
style_section = ParagraphStyle(
    "Section", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=10, leading=12, textColor=PURPLE, spaceBefore=2, spaceAfter=3,
)
style_bullet = ParagraphStyle(
    "Bullet", parent=style_body, leftIndent=14, bulletIndent=2, spaceAfter=1,
    leading=12,
)
style_sign_name = ParagraphStyle(
    "SignName", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=10.5, leading=13, textColor=DARK, alignment=TA_CENTER,
)
style_sign_role = ParagraphStyle(
    "SignRole", parent=styles["Normal"], fontName="Helvetica",
    fontSize=9, leading=11, textColor=GRAY, alignment=TA_CENTER,
)


def draw_header_band(canvas, doc):
    """Draw a purple branded band at the top of the page (landing-style)."""
    page_w, page_h = LETTER
    band_h = 2.6 * cm

    # Solid purple band
    canvas.setFillColor(PURPLE)
    canvas.rect(0, page_h - band_h, page_w, band_h, stroke=0, fill=1)

    # Subtle darker stripe at the bottom of the band
    canvas.setFillColor(PURPLE_DARK)
    canvas.rect(0, page_h - band_h, page_w, 0.18 * cm, stroke=0, fill=1)

    # Logo (left)
    logo_size = 1.7 * cm
    logo_x = 1.8 * cm
    logo_y = page_h - band_h / 2 - logo_size / 2
    canvas.drawImage(
        str(LOGO_PNG), logo_x, logo_y,
        width=logo_size, height=logo_size,
        preserveAspectRatio=True, mask="auto",
    )

    # Brand name + tagline (next to logo)
    text_x = logo_x + logo_size + 0.4 * cm
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 18)
    canvas.drawString(text_x, page_h - band_h / 2 + 0.05 * cm, "LudoraLearning")
    canvas.setFillColor(HexColor("#E8E0F8"))
    canvas.setFont("Helvetica", 8.5)
    canvas.drawString(text_x, page_h - band_h / 2 - 0.40 * cm,
                      "Craft your English skills")

    # Contact info (right)
    canvas.setFillColor(HexColor("#E8E0F8"))
    canvas.setFont("Helvetica", 8.5)
    right_x = page_w - 1.8 * cm
    canvas.drawRightString(right_x, page_h - band_h / 2 + 0.30 * cm,
                           "Tel: +52 81 2327 7490")
    canvas.drawRightString(right_x, page_h - band_h / 2 - 0.05 * cm,
                           "ludoralearning@gmail.com")
    canvas.drawRightString(right_x, page_h - band_h / 2 - 0.40 * cm,
                           "ludoralearning.com")

    # Thin cream accent line below the band
    canvas.setFillColor(CREAM)
    canvas.rect(0, page_h - band_h - 0.10 * cm, page_w, 0.10 * cm, stroke=0, fill=1)


story = []

# Top spacer to clear the branded band (band height + accent line + breathing room)
story.append(Spacer(1, 2.6 * cm + 0.5 * cm))

# Date
story.append(Paragraph("Monterrey, Nuevo León — 27 de abril de 2026", style_date))
story.append(Spacer(1, 8))

# Eyebrow + title (landing-style display)
story.append(Paragraph("CARTA OFICIAL", style_eyebrow))
story.append(Paragraph("Carta de Recomendación Laboral", style_title))

# Thin purple underline under title
underline = Table([[""]], colWidths=[2.2 * cm], rowHeights=[1])
underline.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 1.6, PURPLE)]))
center_underline = Table([[underline]], colWidths=[USABLE_W])
center_underline.setStyle(TableStyle([
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
]))
story.append(center_underline)
story.append(Spacer(1, 12))

# Addressee
story.append(Paragraph("A quien corresponda:", style_addr))

# Body
story.append(Paragraph(
    "Por medio de la presente, hago constar que el Sr. <b>José Carlos Ramírez López</b> "
    "colaboró con <b>LudoraLearning</b> desempeñando el puesto de "
    "<b>Desarrollador Web y Desarrollador de la Plataforma de Alumnos</b>, "
    "durante el periodo comprendido entre <b>enero y abril de 2026</b>.",
    style_body,
))

story.append(Paragraph(
    "Durante su colaboración, José Carlos fue responsable del desarrollo integral de "
    "nuestra plataforma para alumnos, así como de la implementación de "
    "<b>automatizaciones basadas en Inteligencia Artificial</b> orientadas a la evaluación "
    "académica. Su trabajo permitió analizar de manera estructurada la información generada "
    "por los estudiantes para producir <b>retroalimentación personalizada</b>, "
    "ayudándolos a comprender mejor su propio desempeño. Adicionalmente, diseñó y "
    "desarrolló <b>reportes inteligentes para los docentes</b>, los cuales presentan de "
    "forma clara las fortalezas y áreas de oportunidad de cada alumno.",
    style_body,
))

# Two-column skill section to save vertical space
tech_items = [
    "Next.js, React y TypeScript",
    "Supabase (DB + autenticación)",
    "n8n para flujos automatizados",
    "Automatizaciones con IA en educación",
    "Análisis de datos y reportería",
]
soft_items = [
    "Responsabilidad y compromiso",
    "Iniciativa y autonomía",
    "Trabajo en equipo y comunicación",
    "Capacidad de aprendizaje continuo",
]

def bullet_list(items, style):
    return [Paragraph(f"• {it}", style) for it in items]

tech_col = [Paragraph("Habilidades técnicas", style_section)] + bullet_list(tech_items, style_bullet)
soft_col = [Paragraph("Habilidades blandas", style_section)] + bullet_list(soft_items, style_bullet)

skills_table = Table(
    [[tech_col, soft_col]],
    colWidths=[USABLE_W / 2, USABLE_W / 2],
)
skills_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
]))
story.append(skills_table)
story.append(Spacer(1, 6))

# Achievements
story.append(Paragraph("Logros destacados", style_section))
for item in [
    "Lanzamiento exitoso de la plataforma de alumnos, hoy pieza central de nuestra propuesta educativa.",
    "Sistema de evaluación con IA que redujo el tiempo de revisión y elevó la calidad del feedback.",
    "Módulo de reportería para docentes que mejoró la toma de decisiones pedagógicas con base en datos.",
    "Mejoras continuas en la experiencia de usuario y rendimiento del sitio institucional.",
]:
    story.append(Paragraph(f"• {item}", style_bullet))

story.append(Spacer(1, 6))
story.append(Paragraph(
    "Por todo lo anterior, <b>recomiendo ampliamente</b> a José Carlos Ramírez López como un "
    "profesional íntegro, comprometido y altamente capaz. Estoy segura de que será un excelente "
    "activo para cualquier equipo que decida sumarlo. Quedo a sus órdenes para cualquier "
    "información adicional al teléfono <b>+52 81 2327 7490</b> o al correo "
    "<b>ludoralearning@gmail.com</b>.",
    style_body,
))

story.append(Spacer(1, 8))

# === SIGNATURE BLOCK with real handwritten signature image ===
sig_img_w = 4.2 * cm
sig_img_h = sig_img_w * firma_ratio
# Cap signature height so the whole letter fits (3x larger than the original cap)
if sig_img_h > 5.4 * cm:
    sig_img_h = 5.4 * cm
    sig_img_w = sig_img_h / firma_ratio

firma_image = RLImage(str(FIRMA_PNG), width=sig_img_w, height=sig_img_h)

sig_line = Table([[""]], colWidths=[7.5 * cm], rowHeights=[1])
sig_line.setStyle(TableStyle([
    ("LINEBELOW", (0, 0), (-1, -1), 0.8, DARK),
]))

sig_block = Table(
    [
        [firma_image],
        [sig_line],
        [Paragraph("Valeria Alondra Velázquez Sempual", style_sign_name)],
        [Paragraph("CEO de LudoraLearning", style_sign_role)],
    ],
    colWidths=[7.5 * cm],
)
sig_block.setStyle(TableStyle([
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
]))

center_wrap = Table([[sig_block]], colWidths=[USABLE_W])
center_wrap.setStyle(TableStyle([
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
]))
story.append(center_wrap)

doc.build(story, onFirstPage=draw_header_band, onLaterPages=draw_header_band)

# Cleanup temp images
LOGO_PNG.unlink(missing_ok=True)
FIRMA_PNG.unlink(missing_ok=True)

print(f"OK: {OUTPUT.resolve()}")
