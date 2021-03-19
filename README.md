# Video Games

## General

Student 1: Samantha Howlett

Student 2: Kevin Schäfer

## Description

Es gibt viele verschiedene Video Game Genres. Wir zeigen die
Entwicklung eines durch den Benutzer ausgewählten Genres über die
Jahre hinweg.

## Comments

* Das Laden dauert zu Beginn eine Weile (vorallem Firefox)
* Bubble Chart für die Auswahl des Genre
* Bar Chart für den Wachstum der Games
* Line Charts für die Entwicklung von Preis/Rating über die Jahre
* Scatter Chart für Beziehungen verschiedener Attribute (Spielzeit, Preis & Rating)
* Alle Charts haben Tooltips für genauere Informationen

Die Informationen zu den Spielzeiten waren leider nicht durchgehend vorhanden.
Dies hat natürlich das Ergebnis verfälscht, da einige Daten mit einer Spielzeit
von 0 vorhanden sind.
Wir haben die ursprünglichen zwei Scatter Charts verbunden und einen weiteren
Channel (Color) eingeführt, um die Analyse zu vereinfachen. Diese Idee ist uns
während des Erstellen der Präsentation gekommen und war unserer Meinung nach ein
guter Change.

Leider ist der Sourcecode in einem einzigen JavaScript File, weil wir zu Beginn
Schwierigkeiten mit den Imports hatten. Da wir keine kritischen Änderungen mehr
vornehmen wollten, haben wir es dabei belassen. Um es zu organisieren haben, wir
die Charts in einzelne Funktionen aufgeteilt. Auch damit wir sie dynamisch laden
können, bei Auswahl eines Genres über das Bubble Diagramm oder bei der Auswahl
eines Jahres mit der Buttongroup.

Data Acquisition und Integration haben wir anhand von PowerShell Scripts
vorgenommen. Die Dateien liegen der Vollständigkeitshalber im 'data' Folder.

* Data Acquisition: Get-RawgIoGames.ps1 (nur RAWG Daten, Steam konnten per
Download akquiriert werden)
* Data Integration: Join-ResponseFiles.ps1

## Technical information

**Main file path**: index.html

**Source code repo**: <https://gitlab.fhnw.ch/kevin.schaefer/ivispro-video-games>

**Supported Browsers**: Chrome, Chromium Edge, Firefox

**Libraries used**: D3

**Data sources**: [steamspy](https://steamspy.com/), [RAWG](https://rawg.io/)

## Status

Change to yes when your application is ready.
|Version|Status|
|--|--|
|First prototype ready | yes |
|Final version ready  | yes |