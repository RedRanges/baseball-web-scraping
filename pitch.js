module.exports = class Pitch {
  constructor( data = null ) {
    if ( data === null ) {
      this.pitchSpeed = 'Unknown';
      this.pitchType = 'unknown';
      this.result = 'unknown';
      this.pitcher = 'unknown';
      this.count = 'unknown';
    } else {
      this.parseData( data );
    }
    
  } 
  
  parseData = ( data ) => {
    // console.log( data );
    const arr = data.split( '\n' );
    // console.log( arr );
    // console.log( arr.length );
    if ( arr.length === 8 ) {
    this.pitchType = arr[ 0 ];
    this.batter = arr [ 1 ].replace( 'Batter: ', '' );
    this.pitcher = arr[ 2 ].replace( 'Pitcher: ', '' );
    this.pitchSpeed = Number( arr[ 3 ].replace( 'Pitch Speed: ', '' ) );
    this.inning = Number( arr[ 4 ].replace( 'Inning: ', '' ) );
    this.count = arr[ 5 ].replace( 'Count: ', '' );
    this.outs = Number( arr[ 6 ].replace( 'Outs: ', '' ) );
    this.result = arr[ 7 ].replace( 'Result: ', '' );
    } else if ( arr.length === 10 ) {
      this.pitchType = arr[ 0 ];
      this.batter = arr [ 1 ].replace( 'Batter: ', '' );
      this.pitcher = arr[ 2 ].replace( 'Pitcher: ', '' );
      this.exitVelo = Number( arr[ 3 ].replace( 'Exit Velocity: ', '' ) );
      this.launchAngle = Number( arr[ 4 ].replace( 'Launch Angle: ', '' ) );
      this.pitchSpeed = Number( arr[ 5 ].replace( 'Pitch Speed: ', '' ) );
      this.inning = Number( arr[ 6 ].replace( 'Inning: ', '' ) );
      this.count = arr[ 7 ].replace( 'Count: ', '' );
      this.outs = Number( arr[ 8 ].replace( 'Outs: ', '' ) );
      this.result = arr[ 9 ].replace( 'Result: ', '' );
    } else if ( arr.length === 9 ) {
      console.log( '9 length pitch : ', arr );
      this.pitchType = arr[ 0 ];
      this.batter = arr [ 1 ].replace( 'Batter: ', '' );
      this.pitcher = arr[ 2 ].replace( 'Pitcher: ', '' );
      this.exitVelo = Number( arr[ 3 ].replace( 'Exit Velocity: ', '' ) );
      this.pitchSpeed = Number( arr[ 4 ].replace( 'Pitch Speed: ', '' ) );
      this.inning = Number( arr[ 5 ].replace( 'Inning: ', '' ) );
      this.count = arr[ 6 ].replace( 'Count: ', '' );
      this.outs = Number( arr[ 7 ].replace( 'Outs: ', '' ) );
      this.result = arr[ 8 ].replace( 'Result: ', '' );

    } else {
      console.log( arr, arr.length );
      throw "unknown pitch"
    }

  }

}