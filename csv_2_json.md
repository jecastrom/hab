# CSV zu JSON Export. (Excel VBA)

Dieses VBA-Makro konvertiert eine **in Excel geöffnete CSV-Datei** in eine **UTF-8-kodierte JSON-Datei** und führt dabei automatisch eine kleine, aber wichtige Datenbereinigung durch.

Das Makro ist so aufgebaut, dass es **zuverlässig auf englischen und deutschen Excel-Installationen** funktioniert und auch mit **großen CSV-Dateien (1000+ Zeilen)** problemlos umgehen kann.

---

## ✨ Was das Makro macht

- Liest eine CSV-Datei, bei der **alle Daten in Spalte A** stehen
- Erkennt automatisch das **Trennzeichen der CSV-Datei**:
  - `,` (englische / internationale Systeme)
  - `;` (deutsche / europäische Systeme)
- Benennt Spaltenüberschriften **nur für die JSON-Ausgabe** um:
  - `Nr.` → `Gruppe`
  - `Zusatztext` → `Installationsort`
  - `Installationsort` → `Ring`
- Alle anderen Spaltennamen bleiben unverändert
- Fragt den Benutzer nach einem **Objektcode**
  - Der Objektcode wird als **Dateiname der JSON-Datei** verwendet
- Erstellt die JSON-Datei:
  - Im **gleichen Ordner** wie die CSV-Datei
  - Mit **UTF-8-Kodierung** (korrekte Darstellung von Umlauten wie `Ü`, `ä`, `ß`)
- Funktioniert identisch auf **englischen und deutschen Windows-/Excel-Systemen**

---

## 📌 Erwartetes CSV-Format

- Die **Überschriften befinden sich in Zeile 3**
- Die **Daten beginnen ab Zeile 4**
- Der gesamte CSV-Inhalt steht in **Spalte A**
- Die Felder sind durch `,` oder `;` getrennt

---

## ▶️ Verwendung

1. CSV-Datei in Excel öffnen  
2. `ALT + F11` drücken
3. **Einfügen → Modul** auswählen
4. Den untenstehenden Code einfügen
5. VBA-Editor schließen
6. Makro starten: `ALT + F8 → ExportCSVtoJSON`

---

## 🧠 VBA-Code:

```vba
Sub ExportCSVtoJSON()

    Dim ws As Worksheet
    Set ws = ActiveWorkbook.ActiveSheet

    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row

    ' Objektcode abfragen
    Dim objektCode As String
    objektCode = InputBox("Bitte geben Sie den Objektcode ein.", "Objektcode")

    If Trim(objektCode) = "" Then
        MsgBox "Kein Objektcode eingegeben. Vorgang abgebrochen.", vbExclamation
        Exit Sub
    End If

    ' Kopfzeile (Zeile 3)
    Dim headerLine As String
    headerLine = ws.Cells(3, 1).Value

    ' Trennzeichen automatisch erkennen
    Dim delimiter As String
    If InStr(headerLine, ";") > 0 Then
        delimiter = ";"
    Else
        delimiter = ","
    End If

    ' Überschriften aufteilen
    Dim headers As Variant
    headers = Split(headerLine, delimiter)

    ' Mapping der Spaltennamen
    Dim headerMap As Object
    Set headerMap = CreateObject("Scripting.Dictionary")

    headerMap.Add "Nr.", "Gruppe"
    headerMap.Add "Zusatztext", "Installationsort"
    headerMap.Add "Installationsort", "Ring"
    headerMap.Add "Gruppentyp", "Gruppentyp"
    headerMap.Add "Betriebsart", "Betriebsart"
    headerMap.Add "Meldertechnik", "Meldertechnik"
    headerMap.Add "Anz.Melder", "Anz.Melder"
    headerMap.Add "Alarmreaktion", "Alarmreaktion"

    Dim json As String
    json = "[" & vbCrLf

    Dim r As Long, i As Long
    For r = 4 To lastRow

        Dim rowLine As String
        rowLine = ws.Cells(r, 1).Value

        Dim values As Variant
        values = Split(rowLine, delimiter)

        json = json & "  {" & vbCrLf

        For i = LBound(headers) To UBound(headers)

            Dim originalHeader As String
            originalHeader = headers(i)

            If headerMap.Exists(originalHeader) Then

                Dim jsonKey As String
                jsonKey = headerMap(originalHeader)

                Dim value As String
                If i <= UBound(values) Then
                    value = Trim(values(i))
                Else
                    value = ""
                End If

                value = Replace(value, """", "\""") ' Anführungszeichen escapen

                json = json & "    """ & jsonKey & """: """ & value & """"

                If i < UBound(headers) Then json = json & ","
                json = json & vbCrLf
            End If

        Next i

        json = Left(json, Len(json) - 2) & vbCrLf
        json = json & "  }"

        If r < lastRow Then json = json & ","
        json = json & vbCrLf

    Next r

    json = json & "]"

    ' Ausgabepfad erstellen
    Dim basePath As String
    basePath = Left(ActiveWorkbook.FullName, InStrRev(ActiveWorkbook.FullName, "\"))

    Dim jsonPath As String
    jsonPath = basePath & objektCode & ".json"

    ' JSON im UTF-8-Format schreiben
    Dim stream As Object
    Set stream = CreateObject("ADODB.Stream")

    stream.Type = 2
    stream.Charset = "utf-8"
    stream.Open
    stream.WriteText json
    stream.SaveToFile jsonPath, 2
    stream.Close

    MsgBox "JSON-Datei wurde erfolgreich erstellt:" & vbCrLf & jsonPath, vbInformation

End Sub
