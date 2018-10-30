import { pluralize } from 'inflected';

export default (word, count, hideCount = false) => {
  if (count === 1) {
    if (hideCount) {
      return word;
    }

    return `${count} ${word}`;
  }

  if (hideCount) {
    return pluralize(word);
  }

  return `${count} ${pluralize(word)}`;
};
