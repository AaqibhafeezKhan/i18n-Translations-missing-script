# i18n-Translations-missing-script

The scope of the script is to identify if the project has missed traslations. Missed Translations means - translations with the same translation value in all languages.
 For example:

// en.json
{
  ...
  "dashboard.welcome": "welcome",
  ...
}

// de.json
{
  ...
  "dashboard.welcome": "welcome",
  ...
}

// fr.json
{
  ...
  "dashboard.welcome": "welcome",
  ...
}

// it.json
{
  ...
  "dashboard.welcome": "welcome",
  ...
}
In this case, "dashboard.welcome" has only english translation repeated in all languages. Missed.

