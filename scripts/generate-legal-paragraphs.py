#!/usr/bin/env python3
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def docx_paragraphs(path: str) -> list[str]:
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    paras: list[str] = []
    for p in root.iter(f"{ns}p"):
        texts: list[str] = []
        for t in p.iter(f"{ns}t"):
            if t.text:
                texts.append(t.text)
            if t.tail:
                texts.append(t.tail)
        line = "".join(texts).strip()
        if line:
            paras.append(line)
    return paras


SITE_URL = "https://voshod.shop"


def adapt(text: str) -> str:
    return (
        text.replace("RusRaiders", "РАССВЕТ")
        .replace("rusraiders.ru", SITE_URL)
        .replace("ИП Куделькин Иван Олегович", "ИП Остапенко Михаил Вадимович")
        .replace("Куделькин Иван Олегович", "Остапенко Михаил Вадимович")
        .replace("rusraiders@bk.ru", "tratonis2004@mail.ru")
        .replace("+7 (991) 170 18-85, +7 (920) 623-02-52", "8 920 576-04-39")
        .replace(
            "ИНН 332891384009 ОГРНИП 324330000047496",
            "ИНН 312010878603, ОГРНИП 326310000035685",
        )
        .replace(
            "600017, Россия, Владимирская область, г. Владимир, ул. Кирова, д. 6, кв. 32.",
            "р/с 40802810320000987388, банк ООО «Банк Точка», БИК 044525104, к/с 30101810745374525104.",
        )
        .replace("Rusraiders", "РАССВЕТ")
        .replace("телеграм канале РАССВЕТ", "Telegram @moderatorBOCXOD")
        .replace("в Telegram @moderatorBOCXOD на условиях", "в Telegram на условиях")
    )


def postprocess(paragraphs: list[str]) -> list[str]:
    out = [p.replace("https://https://", "https://") for p in paragraphs]
    if out and out[0].startswith("ПУБЛИЧНАЯ ОФЕРТА"):
        # Replace template closing requisites (section 15)
        for i, p in enumerate(out):
            if p.startswith("15. Адрес и реквизиты"):
                out[i:] = [
                    p,
                    "Индивидуальный предприниматель Остапенко Михаил Вадимович",
                    "ИНН 312010878603",
                    "ОГРНИП 326310000035685",
                    "Расчётный счёт 40802810320000987388",
                    "Банк: ООО «Банк Точка»",
                    "БИК 044525104",
                    "Корр. счёт 30101810745374525104",
                    "ИНН банка 9721194461",
                    "Контакты: 8 920 576-04-39, tratonis2004@mail.ru, Telegram @moderatorBOCXOD.",
                    f"Сайт: {SITE_URL}.",
                ]
                break
    return out


def emit(name: str, paras: list[str]) -> None:
    adapted = postprocess([adapt(p) for p in paras])
    const = name.upper().replace("-", "_") + "_PARAGRAPHS"
    out = ROOT / "lib" / "legal" / f"{name}-paragraphs.ts"
    lines = [f'export const {const}: string[] = ' + json.dumps(adapted, ensure_ascii=False, indent=2) + ";"]
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {out} ({len(adapted)} paragraphs)")


def main() -> None:
    offer = "/mnt/c/Users/alantrei/Downloads/Telegram Desktop/Оферта.docx"
    policy = "/mnt/c/Users/alantrei/Downloads/Telegram Desktop/Политика конфиденциальности.docx"
    emit("offer", docx_paragraphs(offer))
    emit("policy", docx_paragraphs(policy))


if __name__ == "__main__":
    main()
