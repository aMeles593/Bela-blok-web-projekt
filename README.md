# Bela-blok web projekt

Web aplikacija za igranje i vođenje rezultata igre **Bela (Belot)**. Aplikacija omogućuje registraciju i prijavu korisnika, pokretanje igara za 2, 3 ili 4 igrača, vođenje rezultata tijekom igre te pregled statistike i povijesti odigranih igara.

Projekt je izrađen kao full-stack web aplikacija korištenjem Angulara, Node.js/Expressa i PostgreSQL baze podataka.

## 🌐 Pokrenuta aplikacija

Aplikacija je dostupna na:

**https://bela-blok.onrender.com/**

Backend API:

**https://bela-blok-web-backend.onrender.com/**

---

## 📌 Funkcionalnosti

Aplikacija omogućuje:

* registraciju korisnika
* prijavu i odjavu korisnika
* dohvaćanje registriranih korisnika
* odabir igrača za igru
* igranje Bele za:

  * 2 igrača
  * 3 igrača
  * 4 igrača
* automatsko formiranje timova
* unos rezultata rundi
* vođenje ukupnog rezultata
* evidentiranje zvanja
* podršku za situaciju „štiglja“
* spremanje završenih igara u bazu podataka
* pregled povijesti odigranih igara
* pregled statistike igrača
* odvojene statistike prema broju igrača
* responzivno korisničko sučelje

---

## 🛠️ Korištene tehnologije

### Frontend

* Angular
* TypeScript
* HTML
* SCSS
* RxJS

### Backend

* Node.js
* Express.js
* JavaScript
* REST API

### Baza podataka

* PostgreSQL
* Neon PostgreSQL

### Ostalo

* Git
* GitHub
* Render

---

## 📁 Struktura projekta

Projekt je podijeljen na frontend i backend dio:

```text
bela_blok/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── ...
│   ├── public/
│   ├── angular.json
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── db/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## 🗄️ Baza podataka

Aplikacija koristi PostgreSQL bazu podataka.

Glavne tablice su:

* `users` – registrirani korisnici
* `games` – osnovni podaci o odigranim igrama
* `game_players` – igrači koji sudjeluju u pojedinoj igri
* `parties` – podaci o partijama
* `rounds` – podaci o pojedinim rundama
* `round_bids` – podaci o ponudama tijekom rundi

Baza podataka koristi relacije između tablica kako bi se povezali korisnici, igre, igrači, partije i runde.

U produkcijskoj verziji aplikacija koristi **Neon PostgreSQL** bazu podataka.

---

## 🔐 Autentifikacija

Korisnici se mogu registrirati i prijaviti u aplikaciju.

Kod registracije korisnik unosi svoje korisničko ime i lozinku.

Nakon uspješne prijave korisnik može pristupiti funkcionalnostima aplikacije, uključujući pokretanje igre i pregled vlastitih podataka.

---

## 🎮 Igra Bela

Aplikacija podržava različite načine igranja.

### 2 igrača

Igra se između dva igrača, pri čemu svaki igrač predstavlja svoju stranu.

### 3 igrača

Igra podržava poseban način vođenja rezultata za tri igrača.

### 4 igrača

Kod četiri igrača igrači se raspoređuju u dva tima:

```text
Tim 1:
Igrač 1
Igrač 2

Tim 2:
Igrač 3
Igrač 4
```

Tijekom igre prate se bodovi, štihovi, zvanja i ukupni rezultat.

---

## 📊 Statistika

Aplikacija sadrži stranicu za pregled statistike.

Prikazuju se ukupni podaci o igranju, kao što su:

* broj odigranih igara
* broj odigranih partija
* broj odigranih rundi
* broj igara za 2 igrača
* broj igara za 3 igrača
* broj igara za 4 igrača
* statistika pojedinačnih igrača

Statistika igrača može se promatrati odvojeno prema načinu igranja.

---

## 💻 Pokretanje projekta lokalno

### Preduvjeti

Za pokretanje projekta potrebno je imati instalirano:

* Node.js
* npm
* PostgreSQL

---

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/aMeles593/Bela-blok-web-projekt.git
```

Ulazak u projekt:

```bash
cd Bela-blok-web-projekt
```

---

## 🚀 Pokretanje backenda

Prvo je potrebno otvoriti backend:

```bash
cd backend
```

Instalacija potrebnih paketa:

```bash
npm install
```

Backend se pokreće naredbom:

```bash
npm start
```

Backend će biti dostupan na:

```text
http://localhost:3000
```

---

## 🌐 Pokretanje frontenda

U novom terminalu potrebno je otvoriti frontend:

```bash
cd frontend
```

Instalacija potrebnih paketa:

```bash
npm install
```

Pokretanje Angular development servera:

```bash
npm start
```

Aplikacija će zatim biti dostupna na:

```text
http://localhost:4200
```

---

## ⚙️ Konfiguracija baze podataka

Backend koristi varijablu:

```env
DATABASE_URL=...
```

Primjer `.env` datoteke:

```env
DATABASE_URL=postgresql://korisnik:lozinka@host/baza
```

**Stvarne podatke za pristup bazi nije potrebno niti smije biti objavljeno na GitHubu.**

`.env` datoteka treba biti dodana u `.gitignore`.

---

## ☁️ Deployment

Aplikacija je postavljena na platformu **Render**.

Projekt se sastoji od:

* Angular frontend servisa
* Node.js/Express backend servisa
* Neon PostgreSQL baze podataka

Frontend:

```text
https://bela-blok.onrender.com/
```

Backend:

```text
https://bela-blok-web-backend.onrender.com/
```

Kod promjene projekta dovoljno je napraviti commit i poslati promjene na GitHub:

```bash
git add .
git commit -m "Opis promjene"
git push
```

Render automatski prepoznaje novu verziju repozitorija i pokreće novi deployment.

---

## 🔄 Arhitektura aplikacije

Pojednostavljeni prikaz komunikacije:

```text
                    ┌─────────────────────┐
                    │       Korisnik      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Angular Frontend    │
                    │      (Render)       │
                    └──────────┬──────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL / Neon   │
                    │      Database       │
                    └─────────────────────┘
```

---

## 🔒 Sigurnost

Osjetljivi podaci poput:

* lozinki
* podataka za spajanje na bazu
* connection stringova
* API ključeva

ne smiju se spremati u Git repozitorij.

Za lokalni razvoj koriste se `.env` varijable koje su izuzete iz Git repozitorija.

---

## 🎓 Svrha projekta

Projekt je izrađen kao praktični projekt web aplikacije s ciljem primjene znanja iz:

* razvoja frontend aplikacija
* razvoja backend aplikacija
* REST API-ja
* rada s relacijskim bazama podataka
* autentifikacije korisnika
* rada s Gitom i GitHubom
* deploymenta web aplikacije
* povezivanja frontend, backend i database dijelova aplikacije

---
