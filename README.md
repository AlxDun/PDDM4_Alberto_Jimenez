# Sistema de gestion de transacciones

Este es un sistema que permite la administracion de las transacciones. El sistema esta construido con Node.js y Express y la bade de datos esta siendo gestionada con MySQL.

---

## Tecnologias utilizadas

- Node.js
- Express.js
- MySQL
- csv-parser
- vite

---

## 📁 Estructura del proyecto
```bash
PPDM4_ALBERTO_JIMENEZ/
│
├── docs/ # Documentation
│       ...
├── server/ # El programa en si
│       ...
├── .gitignore
└── README.md
```

## Instalacion

1. Clonar el repositorio:

```bash
git clone https://github.com/jcomte23/biblioteca-easy.git
cd biblioteca
```
2. Instala dependencias:

```bash
npm install
```

3. Crea y configura el archivo .env:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=db_name
DB_PORT=3306
```

4. Inicializa el backend:
```bash
node server/index.js
```

5. Inicializa el frontend:
```bash
npm run dev
```

# 📬 Licencia
Este proyecto está bajo licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.