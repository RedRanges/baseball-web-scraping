module.exports = class Util {
    getCurrentTimeStamp = () => {
      const date = new Date();
      const dayOfMonth = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const seconds = date.getSeconds();
      return month + '-' + dayOfMonth + '-' + year + ' ' + hour + ':' + minute + ':' + seconds;
    }

    getCurrentDay = () => {
      const date = new Date();
      const dayOfMonth = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return month + '-' + dayOfMonth + '-' + year
    }
}



