TBF jsem na tom pracovala tak 2 dny, když jsem zrovna nedělala projekt tak jsem jezdila v autoškole

Poggers mám řidičák tho!

Mám jediný štěstí, že většina aplikace existovala než jsem začala dělat tohle celý, jinak by to bylo v řiti


Most CSS done by Copilot (Gemini 3 Flash) as always

Most Go done by Kryštof Fabel (random týpek z 4ITa, neznáte ho někdo?) as always, ale naučila jsem se u toho typování a nějakou tu syntaxi!



Pro spuštění (ne deploy) je potřeba zkopírovat věci z env.example v backendu i frontendu do respective .env filů, přepsat to na validní hodnoty a spustit následovně:


cd picasi/backend

go run main.go


cd picasi/frontend

npm run dev


Pro deploy basically to stejný ale

cd picasi/backend

go build -o picasi_server main.go


cd picasi/frontend

npm install

npm run build


vystup z npm run build potom hostovat pomoci napr. nginxu
