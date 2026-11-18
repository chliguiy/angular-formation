import '@angular/localize/init';
import { loadTranslations } from '@angular/localize';
import messages from './locale/messages.fr.json';

// Les tests tournent sans build localisé : on charge le JSON français comme le fait le build `fr`.
loadTranslations(messages.translations);
