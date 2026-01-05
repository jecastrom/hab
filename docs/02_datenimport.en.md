# Data Import & Cleaning Engine

The application transforms raw software exports (CSV files) into clean, searchable information.

## CSV Processing
The parser is specifically tuned to the ESSER standard:
- Header line: Line 3
- First data line: Line 4

This enables reliable detection and processing of the export files.

## Field Mapping
The relevant columns are renamed and mapped as follows:

- `Nr.` → **Group**
- `Zusatztext` → **Installation Location**
- `Installationsort` → **Loop**

## Data Cleaning
A regex-based logic ensures clean data:
- Removes unwanted special characters from typical industry exports: `´`, `@`, `/`, `.`, `°`, `%`, `(`, `)`
- Collapses multiple spaces into one

Result: A clean UI presentation and precise, reliable search functionality.