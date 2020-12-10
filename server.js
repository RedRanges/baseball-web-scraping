const express = require( 'express' );
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const puppeteer = require( 'puppeteer' );
const Calendar = require( './calendar' );
const GamePage = require( './gamePage' );
const fs = require( 'fs' );
const Util = require( './util' );
const secret = require( './secret.json' );
const GameLinksArray = require( './gameLinksArray' );
const config = require( './config.json' ); 

const app = express();
const util = new Util();

const uri = `mongodb://${secret.dbUserName}:${secret.dbPassword}@localhost:27017/baseball-web-scraping?authSource=admin`;
const homePageURL = 'https://baseballsavant.mlb.com';

MongoClient.connect(uri)
.then(
  client => {
    const db = client.db( 'baseball-web-scraping' );
    let collection = db.collection( 'gameUrls' );
    app.listen( 3000, function() { console.log( 'listening on 3000' ) } );

    app.use(express.static(path.join(__dirname, '/public')));
    app.use(bodyParser.json());



    app.get( '/scrape-games', ( req, res ) => {
      console.log( util.getCurrentTimeStamp(), 'GET : /scrape-games' );
      const STARTMONTH = config.startMonth;
      const ENDMONTH = config.endMonth;
      ( async () => {
        

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport( { width: 1920, height: 5000 } );
        await page.goto( homePageURL, { waitUntil : 'networkidle2' } );


        const gameLinksArray = new GameLinksArray();
        const calendar = new Calendar();
        await calendar.navigateToStartMonth( page, STARTMONTH );
        while ( await calendar.getCurrentMonth( page ) !== ENDMONTH ) {
          let dayOfMonth = 0;
          await calendar.getAllDatesFromMonth( page );
          while ( calendar.hasNextDay() ) {
            dayOfMonth +=1;
            await calendar.clickNextDay( page, dayOfMonth );

            await gameLinksArray.pushGamesLinks( page );
            for ( let url of gameLinksArray.gameLinks ) {
              console.log( util.getCurrentTimeStamp(), `inserting : ${ url } `);
              collection.insertOne( { 'url' : url, 'date' : calendar.date } );
            }
            gameLinksArray.gameLinks = [];
        }
          await calendar.clickNextMonth( page );
        }
        const count = await collection.countDocuments();
        res.send( { count : count } );
        await browser.close();
      } )();
      } )

    
    app.get( '/urls', ( req, res ) => {
      console.log( Date.now(), 'GET : /urls' );
      db.collection( 'gameUrls' ).find().toArray( ( err, result ) => {
        res.send( result );
      } )
    } );

    app.get( '/delete-urls', ( req, res ) => {
      db.collection( 'gameUrls' ).drop();
      res.send( 200 );
    } )

    app.get( '/', ( req, res ) => {
      console.log( util.getCurrentTimeStamp(), 'GET : /' );
      res.sendFile(__dirname + '/index.html');
    } );

    app.get( '/count-urls', async ( req, res ) => {
      console.log( util.getCurrentTimeStamp(), 'GET : /count-urls' );
        const count = await collection.countDocuments();
        res.send( { count : count } );
    } )

    app.get( '/calendar', ( req, res ) => {
      console.log( util.getCurrentTimeStamp(), 'GET : /calendar')
      res.sendFile( __dirname + '/public/images/clickDay.png' );
    } )

    
    app.post( '/scrape-pitches', async ( req, res ) => {
      console.log( util.getCurrentTimeStamp(),'POST : /scrape-pitches' );
      db.collection( 'gameUrls' ).find().toArray( async( err , result ) => {

        const startTime  = Date.now();
        console.log( util.getCurrentTimeStamp(), `startTime : ${ startTime }` );
        let gameNumber = Number( req.body.start );
        let gameEnd = Number( req.body.end );
        result = result.slice( gameNumber, gameEnd );
        
        const pitchesCollection = db.collection( 'pitches' );
        const gamePage = new GamePage();
        for ( gameUrl of result ) {
          gameNumber += 1;
          console.log( util.getCurrentTimeStamp(), 'game number : ', gameNumber );
          const date = gameUrl.date
          console.log( 'date : ', date );
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.setViewport( { width: 1920, height: 5000 } );
          console.log( util.getCurrentTimeStamp(), 'go to : ', homePageURL + gameUrl[ 'url' ] );
          await page.goto( homePageURL + gameUrl[ 'url' ], { waitUntil : 'networkidle2' } );
          gamePage.gameDate = date;
          await gamePage.setTeams( page );
          await gamePage.clickHomeBatters( page );
          await gamePage.getPitches( page );
          if ( gamePage.pitches.length === 0 ) {
            fs.appendFile( `./logs/${ util.getCurrentDay() }-cancelled-games.txt`, `${ util.getCurrentTimeStamp() } : CANCELLED GAME : ${gameUrl.url} at GAME NUMBER : ${ gameNumber } \n`, ( err ) => 
            {
              if ( err ) throw err 
              console.log( util.getCurrentTimeStamp(), 'cancelled game : ', gameUrl.url ); 
            } )
          } else {
            console.log( util.getCurrentTimeStamp(), 'inserting :', gamePage.pitches.length, 'pitches' );
            db.collection( 'pitches' ).insertMany( gamePage.pitches );
            gamePage.pitches = [];
          }

          console.log( '##### clicking away page #####' );
          await gamePage.clickAwayBatters( page );
          await gamePage.getPitches( page );
          await browser.close();
          if ( gamePage.pitches.length === 0 ) {
            console.log( 'cancelled game : ', gameUrl.url );
          } else {
            console.log( util.getCurrentTimeStamp(), 'inserting :', gamePage.pitches.length, 'pitches' );
            fs.appendFile( `./logs/${ util.getCurrentDay() }-completed-games.txt`, `${ util.getCurrentTimeStamp() } : COMPLETED GAME NUMBER : ${ gameNumber } at ${ page.url() }\n`, 
            ( err ) => { 
              if ( err ) throw err 
            }
            );
            db.collection( 'pitches' ).insertMany( gamePage.pitches );
            gamePage.pitches = [];   
          }
 
        }
        const endTime = Date.now();
        console.log( `end time : ${ endTime }` );
        const duration = endTime - startTime;
        console.log( `Duration : ${ Math.floor( duration / 1000 ) }`);
        const numOfPitches = await pitchesCollection.countDocuments();

        res.send( { numOfPitches : numOfPitches } );
      } );
    } )

    app.get( '/count-pitches' , async ( req, res ) =>  {
      console.log( util.getCurrentTimeStamp(), 'GET : /count-pitches')
      const pitchesCollection = db.collection( 'pitches' );
      const count = await pitchesCollection.countDocuments();
      res.send( { count : count } );

    } );

    }
)