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

