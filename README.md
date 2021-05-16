# vai21-projekt-3-stahlfre

## Data

Data: 12b4 -- Electricity production by source and total consumption, 2000-2019
Källa: https://pxnet2.stat.fi/PXWeb/pxweb/en/StatFin/StatFin__ene__salatuo/statfin_salatuo_pxt_12b4.px/

Data beskriver energiproduktionen per källa och den totala energikonsumtionen i GWh.
Jag valde data sättet eftersom det skulle vara intressant att veta hurdan energimix vi har i Finland samt hur mycket elektricitet vi importerar.

## Visualiseringsteknik

Jag valde Sankey Diagram som visualiseringsteknik, eftersom man bra kan visualisera förbindelser och storleksförhållandena mellan de olika noderna.

## Utförande
Utförande lyckades rätt så bra. 

Data sorterades till en anan json-fil energy_v2.json som sedan gicks igenom av fixData() för att skapa noder och links.

createSankey() och createSankeyGradient() skappar Sankey-diagrammena.

Det finns fyra olika sätt att sortera noderna, men pga. data sättet så ger "justified" och "Left" samma resultat.

Det går även att flyta på noderna åt alla håll och förbindelserna följer med.

Det går av välja färg tema enligt helfärgad eller "gradient". Gradient fungerar inte helt exakt en nod får först inga förbindelser före man flyttar på den.
