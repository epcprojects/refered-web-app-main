/* eslint-disable no-restricted-imports */
import { AxiosError } from 'axios';
import { FirebaseError } from 'firebase/app';
import ceil from 'lodash/ceil';
import clamp from 'lodash/clamp';
import concat from 'lodash/concat';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import join from 'lodash/join';
import map from 'lodash/map';
import padStart from 'lodash/padStart';
import range from 'lodash/range';
import reverse from 'lodash/reverse';
import round from 'lodash/round';
import slice from 'lodash/slice';
import startCase from 'lodash/startCase';
import startsWith from 'lodash/startsWith';
import unionBy from 'lodash/unionBy';
import words from 'lodash/words';
import { FIREBASE, FIREBASE_ERROR_CODES_TYPE } from './firebase.utils';

const specialCasingToNormal = (specialCaseString: string) => join(words(specialCaseString), ' ');

const initials = (str: string, limit?: number) => {
  return map(words(str), (word) => word[0].toUpperCase())
    .slice(0, limit)
    .join('');
};

const axiosErrorMsg = (err: unknown) => (err instanceof AxiosError ? err.response?.data : 'Something went wrong!');
const firebaseErrorMsg = (err: unknown) => (err instanceof FirebaseError ? (FIREBASE.ERROR_CODE.includes(err.code as any) ? FIREBASE.ERROR_MESSAGE[err.code as FIREBASE_ERROR_CODES_TYPE] : err.code) : 'Something went wrong!');
const asyncGuard = async <T>(callback: () => T | Promise<T>): Promise<{ result: T | null; error: unknown | null }> => {
  try {
    const result = await callback();
    return { result: result, error: null };
  } catch (e) {
    return { result: null, error: e };
  }
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const generateTokens = (val: string) => range(1, val.length + 1).map((len) => slice(val, 0, len).join(''));
const generateTokensForSentence = (val: string) => {
  const words = val.split(' ');
  let keywords = generateTokens(val.trim().toLowerCase());
  words.forEach((word, index) => {
    if (index === 0) return;
    keywords = [...keywords, ...generateTokens(word.trim().toLowerCase())];
  });
  return keywords;
};

export { asyncGuard, axiosErrorMsg, ceil, clamp, concat, debounce, firebaseErrorMsg, generateTokens, generateTokensForSentence, initials, isEqual, isValidUrl, padStart, reverse, round, specialCasingToNormal, startCase, startsWith, unionBy };
