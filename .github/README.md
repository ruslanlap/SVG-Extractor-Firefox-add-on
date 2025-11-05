# GitHub Actions Configuration

Цей проект використовує GitHub Actions для автоматичної збірки та релізу розширень браузера.

## 🤖 Workflows

### Автоматичні збірки

| Workflow | Тригер | Результат |
|----------|--------|-----------|
| **Firefox Build** | Push до `firefox/**` гілок | `.xpi` файл |
| **Chrome Build** | Push до `chrome/**` гілок | `.zip` файл |
| **Validation** | Push до будь-якої гілки | Перевірка коду |
| **Release** | Тег `v*` | Реліз з обома версіями |

## 🚀 Швидкий старт

### Збірка для Firefox
```bash
git checkout -b firefox/my-feature
# make changes
git push origin firefox/my-feature
```

### Збірка для Chrome
```bash
git checkout -b chrome/my-feature
# make changes
git push origin chrome/my-feature
```

### Створення релізу
```bash
git tag v1.2.0
git push origin v1.2.0
```

## 📖 Документація

Детальна документація: [WORKFLOWS.md](WORKFLOWS.md)

## 📦 Артефакти

Після успішної збірки завантажте артефакти на вкладці **Actions**.

---

Для питань див. [WORKFLOWS.md](WORKFLOWS.md)
