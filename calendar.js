const puppeteer = require( 'puppeteer' );

module.exports = class Calendar {
  constructor () {
    this.calendarSelector = '.flex-cal.calendar';
    this.currentMonthSelector = '.react-datepicker__current-month';
    this.previousMonthSelector = '.react-datepicker__navigation--previous';
    this.nextMonthSelector = '.react-datepicker__navigation--next';
    this.daySelector = '.react-datepicker__day';
    this.allDaysInMonthElements = [];
    this.allDaysInMonthSelectors = [];
    this.allDaysOutOfMonthSelectors = [];
    this.currentDaySelected = 0;
    this.month = '';
    this.year = '';
    this.date = '';
    this.currentDay = 0;
  }

  clickCalendar = async ( page ) => {
    console.log( 'clicking calendar' );
    const calendar = await page.$( this.calendarSelector );
    await calendar.click();
    await page.screenshot( { 'path' : './screenshots/clickCalendar.png' } );
  }

  

  getAllDatesFromMonth = async ( page ) => { 
    // select all div day elements that appear on calendar
    this.allDaysInMonthElements = await page.$$( this.daySelector );
    // filter out div day elements by checking which selectors have class that indicates the day is from
    // another month
    // those have additional class - react-datepicker__day--outside-month
    // create array of selectors for all dates in month
    // need to eliminate class  react-datepicker__day--keyboard-selected from selector as it will not be there
    // during execution
    for ( let element of this.allDaysInMonthElements ) {
      let classNames = await page.evaluate( element => element.getAttribute( 'class' ), element );
      if ( classNames[ classNames.length -1 ] !== 'h' ) {
        
        // need to analyze if this code in neccessary
        // currently commented out because on dec 1, august 1 ( aug as start month ) is not working
        // I think because it is selected and thus the class names don't match up
        // however, I think that this is necessary so I need to figure out when it is

        if ( classNames.includes( ' react-datepicker__day--keyboard-selected' ) ) {
          console.log( 'removing selected tag' );
          classNames = classNames.replace(  ' react-datepicker__day--keyboard-selected', '' );
        }

        console.log( 'length of days in month selector array ', this.allDaysInMonthSelectors.length );
        this.allDaysInMonthSelectors.push( classNames );
      } else {
        this.allDaysOutOfMonthSelectors.push( classNames );
      }
    }
    // console.log( this.allDaysInMonthSelectors );
    // console.log( tempAllDaysInMonthElements.length );
  }


  clickPreviousMonth = async ( page, monthsBack = 1 ) => {
    console.log( 'clicking previous month' );
    for ( let i = 0; i < monthsBack; i++ ) {
      const previousMonthButton = await page.$( this.previousMonthSelector );
      await previousMonthButton.click();
      await this.getCurrentMonth( page );
      await this.getCurrentYear( page );
      await page.screenshot( { 'path' : './screenshots/clickPreviousMonth.png' } );
    }
  }


  clickNextMonth = async ( page, monthsForward = 1 ) => {
    console.log( 'clicking next month' );
    await this.clickCalendar( page );
    for ( let i = 0; i < monthsForward; i++ ) {
      // TO DO CLICK NEXT MONTH
      const nextMonthButton = await page.$( this.nextMonthSelector );
      await nextMonthButton.click( page );
      await this.getCurrentMonth( page );
      await this.getCurrentYear( page );
      await page.screenshot( { 'path' : './screenshots/clickNextMonth.png' } );

    }
  }

  clickNextDay = async ( page, dayOfMonth ) => {   
    console.log( 'clicking next day' ); 
    await this.clickCalendar( page );
    // await page.click( `div[class=${this.allDaysOutOfMonthSelectors[ 0 ]}]` );
    const day = this.allDaysInMonthSelectors[ this.currentDaySelected ];

    let date = `${this.year}-${ this.monthToNumber( this.month ) }-${ dayOfMonth }`
    console.log( dayOfMonth );
    this.date = `${this.monthToNumber( this.month )}-${dayOfMonth}-${ this.year}`;

    console.log( date );
    
    const pageClick = page.click( `div[class="${day}"]` );
    try {
    const response = page.waitForResponse( response => response.url() === `https://baseballsavant.mlb.com/statcast-metrics?date=${date}` && response.status() === 200, { 'timeout' : 15000 } );
    await Promise.all([
      pageClick,
      response
    ]);
  } catch ( err ) {
    console.log( err );
  }
    // await page.click( `div[class="${day}"]` );
    // this.delay( 500 );
    console.log( day );
    await page.screenshot( { 'path' : './public/images/clickDay.png' } );
    this.currentDaySelected +=1
    // dayOfMonth += 1;
  }

  getCurrentMonth = async ( page ) => {
    const currentMonth = await page.$( this.currentMonthSelector );
    const currentMonthText = await page.evaluate( currentMonth => currentMonth.textContent, currentMonth );
    const currentMonthSplit = currentMonthText.split( " " );
    this.month = currentMonthSplit [ 0 ];
    return this.month;
  }

  monthToNumber = () => {
    switch ( this.month ) {
      case 'January' :
        return '1';
      case 'February' :
        return '2';
      case 'March' :
        return '3';
      case 'April' :
        return '4';
      case 'May' :
        return '5';
      case 'June' :
        return '6';
      case 'July' :
        return '7';
      case 'August' :
        return '8';
      case 'September' :
        return '9';
      case 'October' :
        return '10';
      case 'November' :
        return '11';
      case 'December' :  
      return '12';
    }
  }

  getCurrentYear = async ( page ) => {
    const currentMonth = await page.$( this.currentMonthSelector );
    const currentMonthText = await page.evaluate( currentMonth => currentMonth.textContent, currentMonth );
    const currentMonthSplit = currentMonthText.split( " " );
    this.year = currentMonthSplit [ 1 ];
    return this.year;
  }

  hasNextDay () {
    if ( this.currentDaySelected < this.allDaysInMonthSelectors.length ) {
      return true
    } else {
      return false
    }
  }

  navigateToStartMonth = async ( page, startMonth ) => {
    console.log( 'navigating to start month' );
    await this.clickCalendar( page );
    while( await this.getCurrentMonth( page ) !== startMonth ) {
      await this.clickPreviousMonth( page );
    }
  }

  getDate = async ( selector ) => {
  }
  
}