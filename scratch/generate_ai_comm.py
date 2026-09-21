import json

with open("scratch/groups/ai_communications.json") as f:
    items = json.load(f)

d = {
    "//nm2/": ["مدل‌ها"],
    "xdA/+p": ["ابزارها"],
    "7FaY4u": ["میزان مصرف"],
    "0WPnTI": ["مشاهده دموی هوش مصنوعی"],
    "ooA+hm": ["در یک نگاه"],
    "drC+Tq": ["آنچه در فضای کاری شما نصب شده و استفاده می‌شود"],
    "EnJuK0": ["گفتگوها"],
    "BYrMT0": ["دستورالعمل‌های فضای کاری"],
    "c6P+Xe": ["دستورالعمل‌های سفارشی که به تمام پرامپت‌های سیستم اضافه می‌شوند"],
    "FHPe8O": ["پرامپت سیستم"],
    "lfFsZ4": ["کانال‌ها"],
    "7wCciB": ["آدرس‌هایی که فضای کاری شما برای ارسال و دریافت ایمیل از صندوق‌های ورودی مشترک استفاده می‌کند"],
    "WT0Ie4": ["افزودن کانال ایمیل"],
    "Nu4DdT": ["همگام‌سازی"],
    "tVKt7G": ["همگام‌سازی ایمیل‌های داخلی"],
    "yHwG3y": ["به‌زودی"],
}

for it in items:
    _id = it["id"]
    if _id not in d:
        msg = it.get("msgid", "")
        if msg == "Models":
            d[_id] = ["مدل‌ها"]
        elif msg == "Skills":
            d[_id] = ["مهارت‌ها"]
        elif msg == "Tools":
            d[_id] = ["ابزارها"]
        elif msg == "Usage":
            d[_id] = ["میزان مصرف"]
        elif msg == "Watch AI demo":
            d[_id] = ["مشاهده دموی هوش مصنوعی"]
        elif msg == "At a glance":
            d[_id] = ["در یک نگاه"]
        elif msg == "What's installed and being used in your workspace":
            d[_id] = ["آنچه در فضای کاری شما نصب شده و استفاده می‌شود"]
        elif msg == "Conversations":
            d[_id] = ["گفتگوها"]
        elif msg == "MCP Server":
            d[_id] = ["سرور MCP"]
        elif msg == "Connect AI assistants like Claude or Cursor to your workspace via the Model Context Protocol":
            d[_id] = ["اتصال دستیاران هوش مصنوعی مانند Claude یا Cursor به فضای کاری شما از طریق پروتکل کانتکست مدل (MCP)"]
        elif msg == "Set up MCP":
            d[_id] = ["راه‌اندازی MCP"]
        elif msg == "Workspace Instructions":
            d[_id] = ["دستورالعمل‌های فضای کاری"]
        elif msg == "Custom instructions appended to every system prompt":
            d[_id] = ["دستورالعمل‌های سفارشی که به تمام پرامپت‌های سیستم افزوده می‌شوند"]
        elif msg == "Expand to full screen":
            d[_id] = ["گسترش به تمام‌صفحه"]
        elif msg == "System Prompt":
            d[_id] = ["پرامپت سیستم"]
        elif msg == "Read the system prompts to understand how the AI works (~4.3k tokens)":
            d[_id] = ["خواندن پرامپت‌های سیستم برای درک نحوه عملکرد هوش مصنوعی (~۴.۳ هزار توکن)"]
        elif msg == "Read system prompts":
            d[_id] = ["خواندن پرامپت‌های سیستم"]
        elif msg == "Channels":
            d[_id] = ["کانال‌ها"]
        elif msg == "Addresses your workspace uses to send and receive email from shared inboxes":
            d[_id] = ["آدرس‌هایی که فضای کاری شما برای ارسال و دریافت ایمیل از صندوق‌های ورودی مشترک استفاده می‌کند"]
        elif msg == "Add email channel":
            d[_id] = ["افزودن کانال ایمیل"]
        elif msg == "Sync":
            d[_id] = ["همگام‌سازی"]
        elif msg == "Control what the workspace imports from connected mailboxes and calendars":
            d[_id] = ["کنترل آنچه فضای کاری از صندوق‌های پستی و تقویم‌های متصل وارد می‌کند"]
        elif msg == "Sync Internal Emails":
            d[_id] = ["همگام‌سازی ایمیل‌های داخلی"]
        elif msg == "Include emails where all participants share the same domain.":
            d[_id] = ["شامل کردن ایمیل‌هایی که تمام شرکت‌کنندگان آن دامنه یکسانی دارند."]
        elif msg == "Blocklist":
            d[_id] = ["لیست مسدود شده"]
        elif msg == "Exclude the following people and domains from the email and calendar sync of every workspace member":
            d[_id] = ["افراد و دامنه‌های زیر را از همگام‌سازی ایمیل و تقویم همه اعضای فضای کاری حذف کن"]
        elif msg == "Add to blocklist":
            d[_id] = ["افزودن به لیست مسدود شده"]
        elif msg == "Whatsapp":
            d[_id] = ["واتساپ"]
        elif msg == "Soon":
            d[_id] = ["به‌زودی"]
        elif msg == "Skill deleted":
            d[_id] = ["مهارت حذف شد"]
        elif msg == "Skill name":
            d[_id] = ["نام مهارت"]
        elif msg == "System skills":
            d[_id] = ["مهارت‌های سیستمی"]
        elif msg == "Skill":
            d[_id] = ["مهارت"]
        elif msg == "Skill activated":
            d[_id] = ["مهارت فعال شد"]
        elif msg == "Search a skill...":
            d[_id] = ["جستجوی یک مهارت..."]
        elif msg == "Delete Skill":
            d[_id] = ["حذف مهارت"]
        else:
            d[_id] = [msg]

with open("scratch/translations/ai_communications.json", "w", encoding="utf-8") as out:
    json.dump(d, out, ensure_ascii=False, indent=2)

print("Generated ai_communications.json with", len(d), "keys!")
