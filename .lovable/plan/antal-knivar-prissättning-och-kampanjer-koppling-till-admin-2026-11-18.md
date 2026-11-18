# Antal knivar, prissättning och kampanjer + koppling till admin-verktyget

## Vad kunden ser
- Nytt fält i bokningsformuläret: **Antal knivar** (1–20, standard 1).
- Under fältet visas ett **preliminärt totalpris** som uppdateras direkt, t.ex. "3 knivar: 330 kr". Pågår en kampanj visas den, t.ex. "Kom och testa: första kniven 50 kr – totalt 270 kr".
- Bekräftelsen efter bokning visar antal knivar och det preliminära priset.

## Hur priset räknas
Pris per kniv bestäms av hur många knivar kunden lämnar (alla knivar får samma styckpris):

```text
Antal  Pris/kniv  Totalt
1      150 kr     150
2      120 kr     240
3      110 kr     330
4      105 kr     420
5+     100 kr     500, 600 ...
```

En kampanj ersätter priset på **första kniven**; övriga knivar följer tabellen ovan:
- 1 kniv: 50 · 2: 50+120 · 3: 50+110+110 · 4: 50+105x3 · 5+: 50+100 per extra kniv.

Prisstegen och kampanjen lagras i databasen, så du ändrar priser i admin-verktyget utan ny kod. En kampanj har namn, pris för första kniven, valfritt start- och slutdatum och en på/av-knapp. Bara en kampanj gäller åt gången.

Priset räknas om på servern när bokningen sparas (inte bara i webbläsaren), och sparas på bokningens betalning. Senare prisändringar påverkar alltså inte redan gjorda bokningar.

## Admin-API:t (skarpa-admin, C#)
- Bokningslistan får med antal knivar, betalsätt, betalstatus och belopp.
- Nya endpoints (endast admin, samma inloggningskontroll som idag):
  - Betalningar: lista, ändra status (t.ex. markera fakturerad/betald).
  - Betalsätt: lista, slå på/av.
  - Prissteg: lista och ändra.
  - Kampanjer: lista, skapa, ändra, aktivera/avaktivera.
  - Upphämtningstider och blockerade datum: lista och ändra (för din tidigare önskan att styra dagar och tider).

## Admin-webben (skarpa-admin-web, Next.js)
- Bokningar: kolumner för knivar, pris, betalsätt och status, med knapp för att ändra status.
- Ny flik **Priser & kampanjer**: redigera prissteg, skapa/aktivera kampanj.
- Ny flik **Tider**: öppettider per veckodag och blockerade datum.

## Leverans
Ändringarna i bokningssidan testas här i förhandsvisningen. Ändringarna i admin-API:t och admin-webben skrivs och pushas till respektive GitHub-repo, men kan inte köras här – du behöver testa dem lokalt eller efter deploy.

## Tekniska detaljer
- Migration: `bookings.knife_count smallint not null default 1 check (1..20)`; `pricing_tiers(min_knives pk, price_per_knife_ore)` seedad 1/150, 2/120, 3/110, 4/105, 5/100; `pricing_campaigns(id, name, first_knife_price_ore, starts_on, ends_on, active)` med partiellt unikt index så max en är aktiv. Båda: publik läsning, skrivning endast service_role (samma mönster som pickup_hours).
- Delad prisfunktion `src/lib/pricing.ts` (ren funktion: tiers + kampanj + antal + datum -> öre) med tester för alla exemplen ovan; SQL-funktionen `calculate_price` speglar den och `submit_pickup_booking` får `p_knife_count`, räknar priset och sätter `payments.amount_ore`.
- Formuläret läser prissteg/aktiv kampanj via en publik server-funktion; kampanjen gäller för hämtningsdatumet.
- C#: nya modeller (Payment, PaymentMethod, PricingTier, PricingCampaign, PickupHour, BlockedDate), DTOs och endpoints med `RequireAuthorization("AdminOnly")`; skrivningar valideras (positiva belopp, giltiga statusar).
- AGENTS.md: regel om att priser bara finns i databasen och räknas om på servern.
