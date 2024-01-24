import { promises } from 'fs';

enum Language {
  EN = 'en',
  DE = 'de',
  FR = 'fr',
  IT = 'it',
}

const pathToI18n = 'path_to_i18n';

async function runStatistics(i18nPath: string): Promise<void> {
  const [
    enTranslation,
    deTranslation,
    frTranslation,
    itTranslation,
  ] = await getJSONObjects(i18nPath);

  const missedTranslations = Object.keys(enTranslation).reduce(
    (accum: {[key: string]: string}, translationKey: string) => {

      const enTranslationValue = enTranslation[translationKey];
      const hasDifferentTranslations = [
        deTranslation[translationKey],
        frTranslation[translationKey],
        itTranslation[translationKey]
      ].some(translation => enTranslationValue === translation);

      if (hasDifferentTranslations) {
        return { ...accum, [translationKey]: enTranslationValue }
      }

      return accum;
    },
    {}
  );

  await promises.writeFile(`${__dirname}/missed-translations.json`, JSON.stringify(missedTranslations, null, 2));
}

function getJSONObjects(i18nPath: string): Promise<[ string, string, string, string ]> {
  const contentByLang = (lang: Language) => promises.readFile(`${i18nPath}/${lang}.json`)
    .then(buffer => buffer.toString())
    .then(jsonContent => JSON.parse(jsonContent));

  return Promise.all([
    contentByLang(Language.EN),
    contentByLang(Language.DE),
    contentByLang(Language.FR),
    contentByLang(Language.IT),
  ]);
}

runStatistics(pathToI18n)
  .then()
  .catch(err => console.error(err));
