const sentence = (word) => {
  if (!word || !word.length) {
    return '';
  }
  return word
	.replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, function(str){ return str.toUpperCase(); })
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b[A-Z][a-z]+\b/g, function(word) {
      return word.toLowerCase();
    })
    .replace(/^[a-z]/g, function(first) {
      return first.toUpperCase();
    });
};

const name = (word) => {
  if (!word || !word.length) {
    return '';
  }
  return word
	.replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    // uppercase the first character
    .toLowerCase().replace(/\b[a-z](?=[a-z]{2})/g, function(letter) {
      return letter.toUpperCase();
    });
};

const phoneNumber = (number) => {
  if (!number || !number.length) {
    return '';
  }
  var s2 = (''+number).replace(/\D/g, '');
  var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
  return (!m) ? null : m[1] + '-' + m[2] + '-' + m[3];
};

const excerpt = (str, maxlen) => {
  if(str.length < maxlen) return str;
  //trim the string to the maximum length
  const trimmedString = str.substr(0, maxlen);
  //re-trim if we are in the middle of a word
  return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' '))) + '..';
};

module.exports = { sentence, name, phoneNumber, excerpt };
