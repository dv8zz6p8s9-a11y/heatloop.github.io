# HeatLoop BETA 0.1 — integracja zgłoszeń

Status: PRZYGOTOWANIE, NIEAKTYWNA. Data: 2026-10-15.

## Stan obecny
FormSubmit został aktywowany i wiadomość TEST-002 została dostarczona na skrzynkę odbiorczą. Nie dowodzi to jeszcze automatycznego tworzenia GitHub Issues ani działania załączników.

## Docelowy przepływ
FormSubmit → e-mail odbiorczy → autoryzowany mechanizm odbioru (np. Gmail API / Apps Script, po zatwierdzeniu uprawnień) → GitHub Issues.

## Zasady
1. Odbieraj wyłącznie wiadomości o zweryfikowanym pochodzeniu i właściwym formacie. Sam temat e-maila nie stanowi dowodu autentyczności.
2. Oznaczaj TEST-002 i inne testy jako test, nie jako potwierdzony błąd. Nie zakładaj, że zgłoszenie użytkownika zostało odtworzone.
3. Usuń z treści zgłoszenia dane osobowe, tokeny i informacje poufne. Nie kopiuj automatycznie załączników do publicznych Issues.
4. Deduplikuj po identyfikatorze wiadomości, zapisuj wynik przetwarzania i obsługuj ponowienia.
5. Utwórz issue z modułem, urządzeniem, przeglądarką, opisem, krokami, oczekiwanym i rzeczywistym wynikiem. Wstępny priorytet jest hipotezą do weryfikacji.
6. Aktualizuj raport BETA dopiero po weryfikacji, na oddzielnej gałęzi dokumentacyjnej.
7. Nie modyfikuj main ani beta-0.1 bez odrębnego polecenia.

## Do uruchomienia
Wymagana jest autoryzacja dostępu do poczty oraz bezpieczne poświadczenia GitHub do tworzenia Issues. Nie umieszczać sekretów w repozytorium ani w aplikacji frontendowej. Przetestować end-to-end jednym kontrolnym zgłoszeniem i sprawdzić brak duplikatów.
