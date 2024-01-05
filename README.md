# i18n-Translations-missing-script

The scope of the script is to identify if the project has missed traslations. Missed Translations means - translations with the same translation value in all languages.
 For example:

// en.json
{
  ...
  "Input.welcome": "welcome",
  ...
}

// de.json
{
  ...
  "Input.welcome": "welcome",
  ...
}

// fr.json
{
  ...
  "Input.welcome": "welcome",
  ...
}

// it.json
{
  ...
  "Input.welcome": "welcome",
  ...
}
In this case, "Input.welcome" has only english translation repeated in all languages. Missed.
Getting started
replace const pathToI18n const in src/index.ts with path to src/assets/i18n in your project.
install dependencies with npm i.
launch script with npm start.
After npm start script is launched, it will create missed-translations.json file with all missed translations.
