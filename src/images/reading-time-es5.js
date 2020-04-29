"use strict";

var WORDS_PER_MIN = 120; // wpm

var IMAGE_READ_TIME = 15; // in seconds

var CHINESE_KOREAN_READ_TIME = 1000; // cpm

var IMAGE_TAGS = ['img', 'Image'];

"use strict";

function humanizeTime(time) {
  if (time < 0.5) {
    return '읽는 데 1분 이내';
  }

  if (time >= 0.5 && time < 1.5) {
    return '읽는 데 1분';
  }

  return "읽는 데 ".concat(Math.ceil(time), "분");
}

function imageCount(imageTags, string) {
  var combinedImageTags = imageTags.join('|');
  var pattern = "<(".concat(combinedImageTags, ")([\\w\\W]+?)[\\/]?>");
  var reg = new RegExp(pattern, 'g');
  return (string.match(reg) || []).length;
}
/**
 *  String#stripTags() -> String
 *
 *  Strip HTML tags string.
 *
 * */


function stripTags(string) {
  var pattern = '<\\w+(\\s+("[^"]*"|\\\'[^\\\']*\'|[^>])+)?>|<\\/\\w+>';
  var reg = new RegExp(pattern, 'gi');
  return string.replace(reg, '');
}

function stripWhitespace(string) {
  return string.replace(/^\s+/, '').replace(/\s+$/, '');
}

function wordsCount(string) {
  var pattern = '\\w+';
  var reg = new RegExp(pattern, 'g');
  return (string.match(reg) || []).length;
} // Chinese / Japanese / Korean


function otherLanguageReadTime(string, chineseKoreanReadTime) {
  var pattern = "[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF66-\uFF9F\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3]";
  var reg = new RegExp(pattern, 'g');
  var count = (string.match(reg) || []).length;
  var time = count / chineseKoreanReadTime;
  var formattedString = string.replace(reg, '');
  return {
    count: count,
    time: time,
    formattedString: formattedString
  };
}

function wordsReadTime(string) {
  var wordsPerMin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : WORDS_PER_MIN;
  var chineseKoreanReadTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : CHINESE_KOREAN_READ_TIME;

  var _otherLanguageReadTim = otherLanguageReadTime(string, chineseKoreanReadTime),
      characterCount = _otherLanguageReadTim.count,
      otherLanguageTime = _otherLanguageReadTim.time,
      formattedString = _otherLanguageReadTim.formattedString;

  var wordCount = wordsCount(formattedString);
  var wordTime = wordCount / wordsPerMin;
  return {
    characterCount: characterCount,
    otherLanguageTime: otherLanguageTime,
    wordTime: wordTime,
    wordCount: wordCount
  };
}

function imageReadTime() {
  var customImageTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : IMAGE_READ_TIME;
  var tags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : IMAGE_TAGS;
  var string = arguments.length > 2 ? arguments[2] : undefined;
  var seconds = 0;
  var count = imageCount(tags, string);

  if (count > 10) {
    seconds = count / 2 * (customImageTime + 3) + (count - 10) * 3; // n/2(a+b) + 3 sec/image
  } else {
    seconds = count / 2 * (2 * customImageTime + (1 - count)); // n/2[2a+(n-1)d]
  }

  return {
    time: seconds / 60,
    count: count
  };
}

function readTime(string, customWordTime, customImageTime, chineseKoreanReadTime, imageTags) {
  var _imageReadTime = imageReadTime(customImageTime, imageTags, string),
      imageTime = _imageReadTime.time,
      imageCount = _imageReadTime.count;

  var strippedString = stripTags(stripWhitespace(string));

  var _wordsReadTime = wordsReadTime(strippedString, customWordTime, chineseKoreanReadTime),
      characterCount = _wordsReadTime.characterCount,
      otherLanguageTime = _wordsReadTime.otherLanguageTime,
      wordTime = _wordsReadTime.wordTime,
      wordCount = _wordsReadTime.wordCount;

  return {
    humanizedDuration: humanizeTime(imageTime + wordTime + otherLanguageTime),
    duration: imageTime + wordTime + otherLanguageTime,
    totalWords: wordCount,
    wordTime: wordTime,
    totalImages: imageCount,
    imageTime: imageTime,
    otherLanguageTimeCharacters: characterCount,
    otherLanguageTime: otherLanguageTime
  };
}