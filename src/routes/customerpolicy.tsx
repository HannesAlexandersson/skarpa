
import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/booking/InfoPage";

export const Route = createFileRoute("/customerpolicy")({
    head: () => ({
        meta: [
            { title: "Kundvillkor – Skärpa" },
            {
                name: "description",
                content:
                    "Kundvillkor för Skärpas knivslipning, bokning, upphämtning, betalning och ansvar.",
            },
            { property: "og:title", content: "Kundvillkor – Skärpa" },
            {
                property: "og:description",
                content:
                    "Information om bokning, knivslipning, upphämtning, betalning och kundens rättigheter.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    }),

    component: () => (
        <InfoPage title="Kundvillkor">
            <div className="space-y-8">
                <section>
                    <p>
                        Dessa kundvillkor gäller när du beställer knivslipning från
                        Skärpa. Genom att boka en tjänst godkänner du villkoren.
                        Villkoren gäller för privatpersoner. För företagskunder,
                        exempelvis restauranger, kan särskilda överenskommelser gälla.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Bokning och beställning</h2>
                    <p>
                        Bokning sker via Skärpas webbplats. En inskickad bokningsförfrågan
                        blir bindande först när Skärpa har bekräftat bokningen.
                    </p>
                    <p>
                        Kunden ansvarar för att de kontaktuppgifter och uppgifter om
                        knivarna som lämnas vid bokningen är korrekta. Om något behöver
                        ändras ska Skärpa kontaktas så snart som möjligt.
                    </p>
                    <p>
                        Eventuella tilläggsarbeten eller ändringar av den överenskomna
                        tjänsten utförs först efter att kunden har informerats och
                        godkänt detta.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Knivarnas skick och information</h2>
                    <p>
                        Kunden ska informera Skärpa om kända skador, sprickor, tidigare
                        reparationer eller andra omständigheter som kan påverka
                        slipningen. Det gäller även om kniven har särskilda egenskaper
                        eller material som kräver särskild hantering.
                    </p>
                    <p>
                        Knivarnas skick kan dokumenteras genom fotografering vid
                        mottagandet. Befintliga skador och tydliga avvikelser kan
                        noteras innan arbetet påbörjas.
                    </p>
                    <p>
                        Om en kniv bedöms vara olämplig eller innebära en särskild risk
                        för skada vid slipning kan Skärpa avstå från att utföra arbetet.
                        Kunden informeras då om detta.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Utförande av tjänsten</h2>
                    <p>
                        Skärpa utför knivslipning med omsorg och fackmässighet.
                        Resultatet påverkas bland annat av knivens konstruktion,
                        stålkvalitet, tidigare slitage, befintliga skador och skick.
                    </p>
                    <p>
                        Slipning innebär att material avlägsnas från knivbladet.
                        Mängden material som behöver avlägsnas beror på knivens skick
                        och vilket resultat som kan uppnås.
                    </p>
                    <p>
                        Det går inte att garantera att alla knivar kan återställas till
                        nyskick. Djupa hack, rost, deformationer och tidigare skador kan
                        påverka det slutliga resultatet. Kunden informeras om
                        betydande begränsningar som upptäcks innan arbetet fortsätter.
                    </p>
                    <p>
                        Skärpa ansvarar för att tjänsten utförs i enlighet med
                        tillämplig lagstiftning. Eventuella fel i tjänsten hanteras
                        enligt gällande konsumenträttsliga regler.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">
                        Upphämtning, transport och återlämning
                    </h2>
                    <p>
                        Skärpa erbjuder upphämtning och återlämning enligt den tid och
                        plats som har överenskommits vid bokningen.
                    </p>
                    <p>
                        Kunden ansvarar för att knivarna är säkert förpackade och
                        överlämnas på ett sätt som gör dem säkra att hantera och
                        transportera. Knivar ska inte lämnas lösa eller oskyddade.
                    </p>
                    <p>
                        Skärpa hanterar kundernas knivar med omsorg under den tid de
                        förvaras eller transporteras av verksamheten. Skärpa vidtar
                        rimliga säkerhetsåtgärder för att skydda mottagna knivar mot
                        förlust, stöld och skada.
                    </p>
                    <p>
                        Ansvar vid förlust eller skada bedöms utifrån omständigheterna
                        och tillämplig lagstiftning. Dessa villkor innebär inte att
                        Skärpa friskriver sig från ansvar som följer av tvingande lag.
                    </p>
                    <p>
                        Kunden ska se till att knivarna kan tas emot och återlämnas
                        vid överenskommen tid. Om en överenskommen tid behöver ändras
                        ska kunden kontakta Skärpa så snart som möjligt.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Priser och betalning</h2>
                    <p>
                        Aktuella priser och eventuella kostnader för upphämtning eller
                        återlämning framgår av Skärpas prisinformation eller av den
                        prisuppgift som lämnas i samband med bokningen.
                    </p>
                    <p>
                        Inga kostnader utöver det överenskomna priset tillkommer utan
                        att kunden först har informerats och godkänt dem.
                    </p>
                    <p>
                        Betalning kan ske med Swish, kontant eller via faktura enligt
                        vad som har överenskommits. Vid fakturabetalning gäller
                        betalningsvillkoren som anges på fakturan.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Avbokning och ändring av tid</h2>
                    <p>
                        Om kunden behöver avboka eller ändra en bokning ska Skärpa
                        kontaktas så snart som möjligt.
                    </p>
                    <p>
                        Om arbetet ännu inte har påbörjats debiteras normalt ingen
                        kostnad för avbokningen. Detta påverkar inte kundens
                        lagstadgade rättigheter enligt reglerna om ångerrätt.
                    </p>
                    <p>
                        Om kunden avbokar efter att arbetet har påbörjats kan
                        ersättning för redan utfört arbete bli aktuell i den
                        utsträckning som följer av tillämplig lagstiftning.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Ångerrätt</h2>
                    <p>
                        Vid avtal som ingås på distans har privatkunder som huvudregel
                        14 dagars ångerrätt enligt distansavtalslagen. Ångerfristen
                        för en tjänst räknas från den dag då avtalet ingås.
                    </p>
                    <p>
                        Om kunden vill att arbetet ska påbörjas innan ångerfristen har
                        löpt ut behöver kunden uttryckligen begära detta.
                    </p>
                    <p>
                        Om kunden uttryckligen begär att tjänsten ska påbörjas under
                        ångerfristen och därefter ångrar avtalet, kan kunden behöva
                        betala en proportionerlig ersättning för den del av tjänsten
                        som redan har utförts, förutsatt att lagens informationskrav
                        är uppfyllda.
                    </p>
                    <p>
                        När tjänsten är helt utförd upphör ångerrätten endast om
                        kunden i förväg uttryckligen har samtyckt till att arbetet
                        påbörjas under ångerfristen och godkänt att ångerrätten
                        därmed går förlorad när tjänsten är fullständigt utförd.
                    </p>
                    <p>
                        Information om hur ångerrätten utövas lämnas i samband med
                        bokningen. Kunden kan även kontakta Skärpa via de
                        kontaktuppgifter som anges på webbplatsen.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Reklamation och fel i tjänsten</h2>
                    <p>
                        Om kunden anser att slipningen har utförts felaktigt ska
                        kunden kontakta Skärpa och beskriva vad som är fel. Det är
                        bra om kunden även bifogar bilder som visar problemet.
                    </p>
                    <p>
                        Skärpa ska ges möjlighet att undersöka den aktuella kniven
                        och, när det är möjligt och lämpligt, åtgärda ett fel.
                    </p>
                    <p>
                        Reklamation ska göras inom skälig tid efter att kunden
                        upptäckt eller borde ha upptäckt felet. Reklamation som görs
                        inom två månader från det att felet upptäcktes anses alltid
                        ha skett i rätt tid. För arbete på lösa saker gäller normalt
                        en yttersta reklamationsfrist på tre år från det att
                        uppdraget avslutades.
                    </p>
                    <p>
                        Kundens rättigheter vid fel i tjänsten regleras av
                        konsumenttjänstlagen. Dessa villkor begränsar inte
                        kundens lagstadgade reklamationsrätt.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Företagskunder</h2>
                    <p>
                        När tjänsten beställs av ett företag eller utförs för
                        användning i näringsverksamhet gäller inte konsumenttjänstlagen
                        på samma sätt som vid köp av privatpersoner.
                    </p>
                    <p>
                        Särskilda villkor om pris, betalning, ansvar, reklamation
                        och återkommande uppdrag kan avtalas separat med företagskunden.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl text-foreground">Kontakt</h2>
                    <p>
                        Vid frågor om bokningar, utförda tjänster, reklamationer eller
                        dessa kundvillkor är du välkommen att kontakta Skärpa via
                        kontaktuppgifterna på webbplatsen.
                    </p>
                </section>
            </div>
        </InfoPage>
    ),
});
