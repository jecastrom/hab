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

## Support for Multi-File Uploads per Site

The application now supports sites (objects) whose data is split across multiple CSV files, a common scenario with larger ESSER exports.

### Functionality
- Administrators can select **multiple CSV files** simultaneously in both the "Create New Object" and "Update Data" workflows.
- The files are merged client-side into a single dataset before upload.
- Duplicates are automatically removed: each detector entry is uniquely identified by its **"Nr."** value (the physical device address). If the same "Nr." appears in more than one file, only one entry is kept.
- The final dataset is **sorted numerically ascending** by "Nr.", ensuring consistent ordering regardless of the order in which files were selected.

### How It Works
1. The file input accepts multiple selections (`<input type="file" multiple>`).
2. All selected files are read and parsed in parallel.
3. Rows are stored in a JavaScript `Map` with "Nr." as the key – this automatically eliminates duplicates.
4. The merged data is converted back to an array, sorted by "Nr.", and sent to the backend for storage.

### Benefits
- Seamless handling of split exports (e.g., 4 separate CSV files for one large site).
- Robust against user error: accidental duplicate file selection is ignored without error messages.
- No server-side changes required – all deduplication and sorting happens securely in the browser.

This makes onboarding and updating large or segmented projects significantly easier and less error-prone.