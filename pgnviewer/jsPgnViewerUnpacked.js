/** Version: 0.7.3 **/
/**
 * Copyright 2014 Toomas Römer
 * 
 * Licensed under the Apache License, Version 2.0 (the "License") you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

function ChessGame(gameAsText) {
  var format;
  if (isYahoo(gameAsText)) {
    /*global Yahoo */
    this.format = new Yahoo(gameAsText);
  } else {
    /*global Pgn */
    this.format = new Pgn(gameAsText);
  }

  function isYahoo(pgn) {
    pgn = pgn.replace(/^\s+|\s+$/g, '');
    return pgn.charAt(0) == ';';
  }
}
/**
 * Copyright 2008-2015 Toomas Römer
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
 * Convert PGN format to an easier format. The problem with PGN is that it is
 * really difficult and ugly to accomplish backward moves.
 * 
 * Let's say we have a move "e4" and we need to go one move back. The only info
 * is that we have placed a pawn to e4. We also have to remember from where did
 * we place the pawn. To make it easier and to have less calculations the PGN is
 * converted into a format where the from square with contents is explicit and
 * to square also. There are other problems also regarding backward moving and
 * remembering which piece was taken.
 */

function Converter(pgn) {
  this.pgn = pgn;
  this.vBoard = new Array(8);
  this.initialBoard = new Array(8);
  this.moves = [];
  this.iteIndex = 0;
  this.whiteToMove = true;
  this.startMoveNum = 1;
  this.flippedI = false;
  this.flippedV = false;

  this.wKing = [];
  this.bKing = [];
  this.wQueens = [];
  this.bQueens = [];
  this.wBishops = [];
  this.bBishops = [];
  this.wRooks = [];
  this.bRooks = [];

  for (var i = 0; i < 8; i++) {
    this.vBoard[i] = new Array(8);
    for (var j = 0; j < 8; j++) {
      this.vBoard[i][j] = new vSquare();
    }
  }

  if (pgn.props['FEN']) {
    var val = pgn.props['FEN'].split(/\/| /g);
    for (var i = 0; i < 8; i++) {
      var file = 0;
      for (var j = 0; j < val[i].length; j++) {
        var c = val[i].charAt(j);
        switch (c) {
        case 'p':
          this.vBoard[i][file].piece = 'pawn';
          this.vBoard[i][file].color = 'black';
          file++;
          break;
        case 'n':
          this.vBoard[i][file].piece = 'knight';
          this.vBoard[i][file].color = 'black';
          file++;
          break;
        case 'k':
          this.vBoard[i][file].piece = 'king';
          this.vBoard[i][file].color = 'black';
          this.bKingX = i;
          this.bKingY = file;
          file++;
          break;
        case 'q':
          this.vBoard[i][file].piece = 'queen';
          this.vBoard[i][file].color = 'black';
          this.bQueens[this.bQueens.length] = [ i, file ];
          file++;
          break;
        case 'r':
          this.vBoard[i][file].piece = 'rook';
          this.vBoard[i][file].color = 'black';
          this.bRooks[this.bRooks.length] = [ i, file ];
          file++;
          break;
        case 'b':
          this.vBoard[i][file].piece = 'bishop';
          this.vBoard[i][file].color = 'black';
          this.bBishops[this.bBishops.length] = [ i, file ];
          file++;
          break;
        case 'P':
          this.vBoard[i][file].piece = 'pawn';
          this.vBoard[i][file].color = 'white';
          file++;
          break;
        case 'N':
          this.vBoard[i][file].piece = 'knight';
          this.vBoard[i][file].color = 'white';
          file++;
          break;
        case 'K':
          this.vBoard[i][file].piece = 'king';
          this.vBoard[i][file].color = 'white';
          this.wKingX = i;
          this.wKingY = file;
          file++;
          break;
        case 'Q':
          this.vBoard[i][file].piece = 'queen';
          this.vBoard[i][file].color = 'white';
          this.wQueens[this.wQueens.length] = [ i, file ];
          file++;
          break;
        case 'R':
          this.vBoard[i][file].piece = 'rook';
          this.vBoard[i][file].color = 'white';
          this.wRooks[this.wRooks.length] = [ i, file ];
          file++;
          break;
        case 'B':
          this.vBoard[i][file].piece = 'bishop';
          this.vBoard[i][file].color = 'white';
          this.wBishops[this.wBishops.length] = [ i, file ];
          file++;
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          file += parseInt(c);
          break;
        }
      }
    }
    if (val[8] == "b") {
      this.whiteToMove = false;
    }
    this.startMoveNum = parseInt(val[12]);
  } else {
    /* Virtual board initialization */

    // pawns
    for (var i = 0; i < 8; i++) {
      this.vBoard[6][i].piece = 'pawn';
      this.vBoard[6][i].color = 'white';

      this.vBoard[1][i].piece = 'pawn';
      this.vBoard[1][i].color = 'black';
    }

    // rooks, bishops, knights
    for (var i = 0; i < 2; i++) {
      this.vBoard[7][i * 7].piece = 'rook';
      this.vBoard[7][i * 7].color = 'white';
      this.wRooks[this.wRooks.length] = [ 7, i * 7 ];

      this.vBoard[0][i * 7].piece = 'rook';
      this.vBoard[0][i * 7].color = 'black';
      this.bRooks[this.bRooks.length] = [ 0, i * 7 ];

      this.vBoard[7][i * 5 + 1].piece = 'knight';
      this.vBoard[7][i * 5 + 1].color = 'white';

      this.vBoard[0][i * 5 + 1].piece = 'knight';
      this.vBoard[0][i * 5 + 1].color = 'black';

      this.vBoard[7][i * 3 + 2].piece = 'bishop';
      this.vBoard[7][i * 3 + 2].color = 'white';
      this.wBishops[this.wBishops.length] = [ 7, i * 3 + 2 ];

      this.vBoard[0][i * 3 + 2].piece = 'bishop';
      this.vBoard[0][i * 3 + 2].color = 'black';
      this.bBishops[this.bBishops.length] = [ 0, i * 3 + 2 ];
    }

    this.vBoard[7][3].piece = 'queen';
    this.vBoard[7][3].color = 'white';
    this.wQueens[this.wQueens.length] = [ 7, 3 ];

    this.vBoard[7][4].piece = 'king';
    this.vBoard[7][4].color = 'white';
    this.wKingX = 7;
    this.wKingY = 4;

    this.vBoard[0][3].piece = 'queen';
    this.vBoard[0][3].color = 'black';
    this.bQueens[this.bQueens.length] = [ 0, 3 ];

    this.vBoard[0][4].piece = 'king';
    this.vBoard[0][4].color = 'black';
    this.bKingX = 0;
    this.bKingY = 4;

    /* EO Virtual board initialization */
  }

  // let's clone the initial pos
  for (var i = 0; i < 8; i++) {
    this.initialBoard[i] = new Array(8);
    for (var j = 0; j < 8; j++) {
      this.initialBoard[i][j] = this.vBoard[i][j].clone();
    }
  }

  this.convert = function() {
    var move = null;
    do {
      move = this.convertMove();
      if (move)
        this.moves[this.moves.length] = move;
    } while (move);
  };

  /*
   * Result iterator
   */

  this.getCurMove = function() {
    if (this.moves.length > this.iteIndex)
      return this.moves[this.iteIndex];
    return null;
  };

  this.getCurMoveNo = function() {
    return this.iteIndex;
  };

  this.nextMove = function() {
    if (this.moves.length > this.iteIndex)
      return this.moves[this.iteIndex++];
    return null;
  };

  this.prevMove = function() {
    if (this.iteIndex > 0)
      return this.moves[--this.iteIndex];
    return null;
  };

  this.resetToEnd = function() {
    this.iteIndex = this.moves.length;
  };

  this.resetToStart = function() {
    this.iteIndex = 0;
  };

  /*
   * EOF Result Iterator
   */

  this.getStartPos = function(flipped) {
    if (flipped != this.flippedI) {
      this.flipBoard(this.initialBoard);
      this.flippedI = !this.flippedI;
    }
    return this.initialBoard;
  };

  this.getEndPos = function(flipped) {
    if (flipped != this.flippedV) {
      this.flipBoard(this.vBoard);
      this.flippedV = !this.flippedV;
    }
    return this.vBoard;
  };

  this.flipBoard = function(board) {
    this.flipped = !this.flipped;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 4; j++) {
        var tmp = board[i][j];
        board[i][j] = board[7 - i][7 - j];
        board[7 - i][7 - j] = tmp;
      }
    }
  };

  /*
   * Convert a move.
   */
  this.convertMove = function(board) {
    var to = this.pgn.nextMove();
    var oldTo = to;
    if (to === null)
      return;
    var color = to[1];
    to = to[0];

    /*
     * Check which piece has to move. Find the location of the piece.
     */
    var pawnre = /^[a-z]+[1-8]/;
    var genericre = /^[a-z][1-8]-[a-z][1-8]/;
    var knightre = /^N[0-9]?[a-z]+[1-8]/i;
    var bishre = /^B[a-z]+[1-8]/;
    var queenre = /^Q([a-z]|[0-9])?[a-z]+[1-8]/i;
    var rookre = /^R([a-z]|[0-9])?[a-z]+[1-8]/i;
    var lCastlere = /^(0|O)-(0|O)-(0|O)/i;
    var sCastlere = /^(0|O)-(0|O)/i;
    var kingre = /^K[a-z]+[1-8]/i;
    var prom = "";

    var toCoords = getSquare(to);
    var fromCoords, from, to, result, myMove = null, pawnM = false;
    if (knightre.test(to)) {
      fromCoords = findFromKnight(this, to, toCoords, color);
    } else if (bishre.test(to)) {
      fromCoords = findFromBish(this, this.vBoard, to, toCoords, color);
    } else if (queenre.test(to)) {
      fromCoords = findFromQueen(this, this.vBoard, to, toCoords, color);
    } else if (rookre.test(to)) {
      fromCoords = findFromRook(this, this.vBoard, to, toCoords, color);
    } else if (kingre.test(to)) {
      fromCoords = findFromKing(this, this.vBoard, color);
    } else if (sCastlere.test(to)) {
      var bCoords = new Array('e8', 'g8', 'h8', 'f8');
      var wCoords = new Array('e1', 'g1', 'h1', 'f1');

      if (lCastlere.test(to)) {
        bCoords = new Array('e8', 'c8', 'a8', 'd8');
        wCoords = new Array('e1', 'c1', 'a1', 'd1');
      }
      var coords = color == 'white' ? wCoords : bCoords;

      fromCoords = getSquare(coords[0]);
      toCoords = getSquare(coords[1]);

      from = this.vBoard[fromCoords[0]][fromCoords[1]];
      to = this.vBoard[toCoords[0]][toCoords[1]];
      // update king location
      if ('king' == from.piece && 'white' == from.color) {
        this.wKingX = toCoords[0];
        this.wKingY = toCoords[1];
      }
      else if ('king' == from.piece && 'black' == from.color) {
        this.bKingX = toCoords[0];
        this.bKingY = toCoords[1];
      }
        

      result = movePiece(this, from, to, prom);

      myMove = new MyMove();
      myMove.moveStr = oldTo[0];
      myMove.oPiece = result[2].piece;
      myMove.oColor = result[2].color;
      myMove.pPiece = result[3];

      myMove.add(new MySquare(fromCoords[0], fromCoords[1], result[0].piece,
          result[0].color));

      myMove.add(new MySquare(toCoords[0], toCoords[1], result[1].piece,
          result[1].color));

      fromCoords = getSquare(coords[2]);
      toCoords = getSquare(coords[3]);
    } else if (genericre.test(to)) {
      // dbl information move, g4-g6
      fromCoords = findFromAny(this, this.vBoard, to, toCoords, color);
    } else if (pawnre.test(to)) {
      // let see if it is a promotional move
      // promotion is indicated by the = sign or just last letter
      if (/^[a-z]+[1-8](=?)[A-Z]/.test(to)) {
        // have to be careful if the last char is not a letter
        // for example + or ++ for cehck or mate or something similar
        var tmpI = 0;
        for (tmpI = to.length - 1; tmpI >= 0; tmpI--) {
          if (/^[A-Z]/.test(to.charAt(tmpI))) {
            prom = to.charAt(tmpI);
            break;
          }
        }
      }

      fromCoords = findFromPawn(this.vBoard, to, toCoords, color);
      pawnM = true;
    } else {
      throw ("Can't figure out which piece to move '" + oldTo + "'");
    }

    from = this.vBoard[fromCoords[0]][fromCoords[1]];
    to = this.vBoard[toCoords[0]][toCoords[1]];

    // update king location
    if ('king' == from.piece && 'white' == from.color) {
      this.wKingX = toCoords[0];
      this.wKingY = toCoords[1];
    } else if ('king' == from.piece && 'black' == from.color) {
      this.bKingX = toCoords[0];
      this.bKingY = toCoords[1];
      // update bishops location
    } else if ('bishop' == from.piece) {
      var idx;
      if ('white' == from.color) {
        idx = findPieceIdx(this.wBishops, fromCoords);
        this.wBishops[idx][0] = toCoords[0];
        this.wBishops[idx][1] = toCoords[1];
      } else {
        idx = findPieceIdx(this.bBishops, fromCoords);
        this.bBishops[idx][0] = toCoords[0];
        this.bBishops[idx][1] = toCoords[1];
      }
    } else if ('queen' == from.piece) {
      var idx;
      if ('white' == from.color) {
        idx = findPieceIdx(this.wQueens, fromCoords);
        this.wQueens[idx][0] = toCoords[0];
        this.wQueens[idx][1] = toCoords[1];
      } else {
        idx = findPieceIdx(this.bQueens, fromCoords);
        this.bQueens[idx][0] = toCoords[0];
        this.bQueens[idx][1] = toCoords[1];
      }
    } else if ('rook' == from.piece) {
      var idx;
      if ('white' == from.color) {
        idx = findPieceIdx(this.wRooks, fromCoords);
        this.wRooks[idx][0] = toCoords[0];
        this.wRooks[idx][1] = toCoords[1];
      } else {
        idx = findPieceIdx(this.bRooks, fromCoords);
        this.bRooks[idx][0] = toCoords[0];
        this.bRooks[idx][1] = toCoords[1];
      }
    }

    if ('queen' == to.piece) {
      var idx;
      if ('white' == to.color) {
        idx = findPieceIdx(this.wQueens, toCoords);
        this.wQueens.splice(idx, 1);
      } else {
        idx = findPieceIdx(this.bQueens, toCoords);
        this.bQueens.splice(idx, 1);
      }
    } else if ('bishop' == to.piece) {
      var idx;
      if ('white' == to.color) {
        idx = findPieceIdx(this.wBishops, toCoords);
        this.wBishops.splice(idx, 1);
      } else {
        idx = findPieceIdx(this.bBishops, toCoords);
        this.bBishops.splice(idx, 1);
      }
    } else if ('rook' == to.piece) {
      var idx;
      if ('white' == to.color) {
        idx = findPieceIdx(this.wRooks, toCoords);
        this.wRooks.splice(idx, 1);
      } else {
        idx = findPieceIdx(this.bRooks, toCoords);
        this.bRooks.splice(idx, 1);
      }
    }

    // in case of castling we don't have a null value
    if (!myMove)
      myMove = new MyMove();

    var enPassante = null;
    if (pawnM)
      enPassante = getEnPassante(this, fromCoords[0], fromCoords[1],
          toCoords[0], toCoords[1]);

    if (enPassante) {
      var sq = this.vBoard[enPassante[0]][enPassante[1]];
      var enP = new MySquare(enPassante[0], enPassante[1], sq.piece, sq.color);
      myMove.enP = enP;
      this.vBoard[enPassante[0]][enPassante[1]].color = null;
      this.vBoard[enPassante[0]][enPassante[1]].piece = null;
      this.vBoard[enPassante[0]][enPassante[1]].type = null;
    }

    result = movePiece(this, from, to, prom);

    myMove.oPiece = result[2].piece;
    myMove.oColor = result[2].color;
    myMove.pPiece = result[3];
    myMove.moveStr = oldTo[0];

    if (prom) {
      if ("queen" == result[1].piece) {
        if ('white' == result[1].color) {
          this.wQueens[this.wQueens.length] = [ toCoords[0], toCoords[1] ];
        } else {
          this.bQueens[this.bQueens.length] = [ toCoords[0], toCoords[1] ];
        }
      } else if ("bishop" == result[1].piece) {
        if ('white' == result[1].color) {
          this.wBishops[this.wBishops.length] = [ toCoords[0], toCoords[1] ];
        } else {
          this.bBishops[this.bBishops.length] = [ toCoords[0], toCoords[1] ];
        }
      } else if ("rook" == result[1].piece) {
        if ('white' == result[1].color) {
          this.wRooks[this.wRooks.length] = [ toCoords[0], toCoords[1] ];
        } else {
          this.bRooks[this.bRooks.length] = [ toCoords[0], toCoords[1] ];
        }
      }
    }

    myMove.add(new MySquare(fromCoords[0], fromCoords[1], result[0].piece,
        result[0].color));

    myMove.add(new MySquare(toCoords[0], toCoords[1], result[1].piece,
        result[1].color));

    return myMove;
  };

  /*
   * FINDING FROM LOCATION FUNCTIONS When a SAN (Standard Algebraic Notation)
   * move is given we need to figure out from where the move is made. Lets say
   * the SAN is "e4" - pawn moves to e4. The from location can be e2, e3 or e5.
   * This depends on the color of the player and on where the pawn was located.
   * All pieces have different logic on finding which piece exactly has to move
   * to the location.
   */

  findPieceIdx = function(arr, coords) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][0] == coords[0] && arr[i][1] == coords[1]) {
        return i;
      }
    }
  };

  /*
   * Find the pawn from location.
   */
  findFromPawn = function(pos, to, tmp, color) {
    var x = tmp[1], y = tmp[0];

    if (tmp[2][0] != -1 && tmp[2][1] != -1) {
      return new Array(tmp[2][1], tmp[2][0]);
    }

    // taking move or with xtra information
    if (tmp[2][0] != -1 || tmp[3] != -1) {
      var froms = new Array(new Array(tmp[0] + 1, tmp[1] - 1), new Array(
          tmp[0] + 1, tmp[1] + 1), new Array(tmp[0] - 1, tmp[1] - 1),
          new Array(tmp[0] - 1, tmp[1] + 1));

      for (var i = 0; i < froms.length; i++) {
        try {
          if (pos[froms[i][0]][froms[i][1]].piece == 'pawn' && pos[froms[i][0]][froms[i][1]].color == color) {
            // we have the file information too
            if (tmp[3] != -1 && tmp[3] == froms[i][1]) {
              // no back taking
              if (y < froms[i][0] && color == "black")
                continue;
              if (y > froms[i][0] && color == "white")
                continue;
              return new Array(froms[i][0], froms[i][1]);
            }
            // else
            // return new Array(froms[i][0], froms[i][1])
          }
        } catch (e) {
        }
      }
    } else {
      // non-taking move
      try {
        var j;
        for (var i = 0; i < 8; i++) {
          j = (color == 'white') ? 7 - i : i;
          if (pos[j][x].piece == 'pawn' && pos[j][x].color == color) {
            if (Math.abs(j - y) > 2) {
              continue;
            }
            // we might be looking at the wrong pawn
            // there can be one between src and dst
            if (2 == Math.abs(j - y)) {
              var j2 = (color == 'white') ? (j - 1) : j + 1;
              if (pos[j2][x].piece == 'pawn' && pos[j2][x].color == color) {
                return new Array(j2, x);
              }
            }
            return new Array(j, x);
          }
        }
      } catch (e) {
      }
    }
    throw ("Could not find a move with a pawn '" + to + "'");
  };

  /*
   * Find the bishop from location.
   */
  function findFromBish(board, pos, toSAN, toCoords, color) {
    if (toCoords[2][0] != -1 && toCoords[2][1] != -1) {
      return new Array(toCoords[2][1], toCoords[2][0]);
    }

    var arr;
    if (color == 'white') {
      arr = board.wBishops;
    } else {
      arr = board.bBishops;
    }

    // you could have multiple bishops that can move there
    // if the from is unknown then the closest can move
    var moves = new Array();
    for (var i = 0; i < arr.length; i++) {
      if (Math.abs(arr[i][0] - toCoords[0]) == Math
          .abs(arr[i][1] - toCoords[1])) {
        moves[moves.length] = new Array(arr[i][0], arr[i][1]);
      }
    }

    if (moves.length>0) {
      return moves[moves.length-1];
    }
    throw ('No move found for the bishop ' + toSAN);
  }

  /*
   * Find from any move
   */
  function findFromAny(board, pos, toSAN, toCoords, color) {
    if (toCoords[2][0] != -1 && toCoords[2][1] != -1) {
      return new Array(toCoords[2][1], toCoords[2][0]);
    }

    throw ('No move found for the generic move ' + toSAN);
  }

  /*
   * Find the king from location.
   */
  function findFromKing(board, pos, color) {
    var x = board.wKingX, y = board.wKingY;
    if ("black" == color) {
      x = board.bKingX;
      y = board.bKingY;
    }
      
    return new Array(x, y);
  }

  /*
   * Find the queen's from location.
   */
  function findFromQueen(board, pos, toSAN, to, color) {
    var extra = to[2];
    var rtrns = [];

    if (to[2][0] != -1 && to[2][1] != -1) {
      return new Array(to[2][1], to[2][0]);
    }

    var arr;
    if (color == 'white') {
      arr = board.wQueens;
    } else if (color == 'black') {
      arr = board.bQueens;
    }
    for (var i = 0; i < arr.length; i++) {
      var rdx = to[0] - arr[i][0];
      var rdy = to[1] - arr[i][1];
      var dx = Math.abs(rdx);
      var dy = Math.abs(rdy);
      if (rdx > 0) {
        rdx = 1;
      } else if (rdx < 0) {
        rdx = -1;
      }
      if (rdy > 0) {
        rdy = 1;
      } else if (rdy < 0) {
        rdy = -1;
      }
      if (dx == dy || dx === 0 || dy === 0) { // bishop-like move or
        // rook-like move
        var x = arr[i][0];
        var y = arr[i][1];
        var limiter = 0;
        while (true) {
          x += rdx;
          y += rdy;
          if (x == to[0] && y == to[1]) {
            if (extra[0] != -1 || extra[1] != -1) {
              if (extra[0] != arr[i][1] && extra[1] != arr[i][0]) {
                break;
              }
              return new Array(arr[i][0], arr[i][1]);
            }
            rtrns[rtrns.length] = new Array(arr[i][0], arr[i][1]);
            break;
          }
          var tmp = pos[x][y];
          if (tmp && tmp.piece) { // ran into another piece
            break;
          } else if (limiter++ > 8) {
            throw ("No queen move found '" + toSAN + "'");
          }
        }
      }
    }

    if (rtrns.length > 1) {
      for (var i = 0; i < rtrns.length; i++) {
        var from = pos[rtrns[i][0]][rtrns[i][1]];
        var oldTo = pos[to[0]][to[1]];

        pos[rtrns[i][0]][rtrns[i][1]] = new vSquare();
        pos[to[0]][to[1]] = from;

        var checked = isKingChecked(board, from.color, pos);
        pos[rtrns[i][0]][rtrns[i][1]] = from;
        pos[to[0]][to[1]] = oldTo;
        if (checked)
          continue;
        else
          return rtrns[i];
      }
    } else if (rtrns.length == 1)
      return rtrns[0];

    throw ("No queen move found '" + toSAN + "'");
  }

  /*
   * Find the rook's from location.
   */
  function findFromRook(board, pos, toSAN, to, color) {
    var extra = to[2];
    var rtrns = [];

    var rooks;
    if (color == 'white') {
      rooks = board.wRooks;
    } else {
      rooks = board.bRooks;
    }

    // loop through rooks and lets see
    // which one can move to the position
    for (var i = 0; i < rooks.length; i++) {
      var rdx = to[0] - rooks[i][0];
      var rdy = to[1] - rooks[i][1];
      var dx = Math.abs(rdx);
      var dy = Math.abs(rdy);

      // determine direction
      if (rdx > 0) {
        rdx = 1;
      } else if (rdx < 0) {
        rdx = -1;
      }

      if (rdy > 0) {
        rdy = 1;
      } else if (rdy < 0) {
        rdy = -1;
      }

      var limiter = 0;
      if (dx === 0 || dy === 0) {
        var x = rooks[i][0];
        var y = rooks[i][1];
        while (true) {
          x += rdx;
          y += rdy;
          if (x == to[0] && y == to[1]) {
            // if we have all extra information
            // and positions match, we have a win
            if (extra[0] != -1 && extra[1] != -1) {
              if (extra[1] == rooks[i][0] && extra[0] == rooks[i][1]) {
                return new Array(rooks[i][0], rooks[i][1]);
              }
            }
            // if we have some extra information
            else if (extra[0] != -1 || extra[1] != -1) {
              if (extra[1] != rooks[i][0] && extra[0] != rooks[i][1]) {
                break;
              }
              return new Array(rooks[i][0], rooks[i][1]);
            }

            rtrns[rtrns.length] = new Array(rooks[i][0], rooks[i][1]);
            break;
          }

          tmp = pos[x][y];
          if (tmp && tmp.piece) { // ran into another piece
            break;
          } else if (limiter++ > 8) {
            throw ("No rook move found '" + toSAN + "'");
          }
        }
      }
    }

    if (rtrns.length > 1) {
      for (var i = 0; i < rtrns.length; i++) {
        var from = pos[rtrns[i][0]][rtrns[i][1]];
        var oldTo = pos[to[0]][to[1]];

        pos[rtrns[i][0]][rtrns[i][1]] = new vSquare();
        pos[to[0]][to[1]] = from;

        var checked = isKingChecked(board, from.color, pos);
        pos[rtrns[i][0]][rtrns[i][1]] = from;
        pos[to[0]][to[1]] = oldTo;
        if (checked)
          continue;
        else
          return rtrns[i];
      }
    } else if (rtrns.length == 1)
      return rtrns[0];

    throw ("No rook move found '" + toSAN + "'");
  }

  /*
   * Find the knight's from location.
   */
  findFromKnight = function(brd, toSAN, toCoords, color) {
    var to = toCoords;
    var extra = to[2];

    if (toCoords[2][0] != -1 && toCoords[2][1] != -1) {
      return new Array(toCoords[2][1], toCoords[2][0]);
    }

    var pos = brd.vBoard;
    var rtrns = [];
    var froms = new Array(new Array(to[0] + 2, to[1] + 1), new Array(to[0] + 2,
        to[1] - 1),

    new Array(to[0] - 2, to[1] + 1), new Array(to[0] - 2, to[1] - 1),

    new Array(to[0] + 1, to[1] + 2), new Array(to[0] - 1, to[1] + 2),

    new Array(to[0] + 1, to[1] - 2), new Array(to[0] - 1, to[1] - 2));

    for (var i = 0; i < froms.length; i++) {
      try {
        var tmp = pos[froms[i][0]][froms[i][1]];
        if (tmp.piece == 'knight' && tmp.color == color) {
          if (extra[0] != -1 && froms[i][1] != extra[0]) {
            continue;
          } else if (extra[1] != -1 && froms[i][0] != extra[1]) {
            continue;
          }
          rtrns[rtrns.length] = new Array(froms[i][0], froms[i][1]);
        }
      } catch (e) {
      }
    }

    if (rtrns.length > 1) {
      for (var i = 0; i < rtrns.length; i++) {
        var from = pos[rtrns[i][0]][rtrns[i][1]];
        pos[rtrns[i][0]][rtrns[i][1]] = new vSquare();

        var checked = isKingChecked(brd, from.color, pos);
        pos[rtrns[i][0]][rtrns[i][1]] = from;
        if (checked)
          continue;
        else
          return rtrns[i];
      }
      return rtrns[0];
    } else if (rtrns.length == 1)
      return rtrns[0];
    throw ("No knight move found. '" + toSAN + "'");
  };

  /*
   * Converts a SAN (Standard Algebraic Notation) into board coordinates. The
   * SAN is in the format of eg e4, dxe4, R2b7. When SAN contains extra
   * information "taking move", "en passante", "check", "piece from a specific
   * file or rank" it is also extracted.
   */
  function getSquare(coord) {
    if (arguments.length != 1) {
      throw "Wrong number of arguments";
    }

    // if only from certain file we can make the move
    var extra = new Array(-1, -1);
    var taking = -1;
    var map = {'a':7, 'b':6, 'c':5, 'd':4,
           'e':3, 'f':2, 'g':1, 'h':0};

    // trim the everything from +
    if (coord.indexOf("+") != -1)
      coord = coord.substring(0, coord.indexOf("+"));
    // let's trim the piece prefix
    if (/^[A-Z]/.test(coord) || /^[nbrqk]{1,1}[abcdefgh]{1,1}/.test(coord)) {
      coord = coord.substr(1);
    }

    // the move is a taking move, we have to look for different
    // files then with pawns
    if (/x/.test(coord)) {
      var tmp = coord.split("x");
      if (tmp[0].length) {
        if (/[a-z][0-9]/.test(tmp[0])) {
          extra[0] = 7 - map[tmp[0].charAt(0)];
          extra[1] = 8 - tmp[0].charAt(1);
        } else if (/[a-z]/.test(tmp[0]))
          extra[0] = 7 - map[tmp[0]];
        else if (/[0-9]/.test(tmp[0]))
          extra[1] = 8 - tmp[0];
      }
      coord = tmp[1];
      taking = 7 - map[tmp[0]];
    }

    // we have extra information on the from file
    // eg Rbd7
    if (/^[a-z]{2,2}/.test(coord)) {
      extra[0] = 7 - map[coord.substring(0, 1)];
      coord = coord.substring(1);
    }

    // we have the row no
    // eg R8d5
    if (/^[0-9][a-z][0-9]/.test(coord)) {
      extra[1] = 8 - coord.substring(0, 1);
      coord = coord.substring(1);
    }

    // we have both Ng8e7
    if (/^([a-z][0-9])[a-z][0-9]/.test(coord)) {
      var tmp = coord.match(/^([a-z][0-9])[a-z][0-9]/);
      extra[0] = 7 - map[tmp[1].charAt(0)];
      extra[1] = 8 - tmp[1].charAt(1);
      coord = coord.replace(/[a-z][0-9]/, "");
    }

    // we have Yahoo format, e2-e4
    if (/^([a-z][0-9])-([a-z][0-9])/.test(coord)) {
      var tmp = coord.match(/^([a-z][0-9])-([a-z][0-9])/);
      extra[0] = 7 - map[tmp[1].charAt(0)];
      extra[1] = 8 - tmp[1].charAt(1);
      coord = tmp[2];
    }

    var rtrn = new Array(8 - coord.charAt(1), 7 - map[coord.charAt(0)], extra,
        taking);

    return rtrn;
  }

  getEnPassante = function(brd, x1, y1, x2, y2) {
    var from = brd.vBoard[x1][y1];
    var to = brd.vBoard[x2][y2];

    // pawn move
    if ("pawn" != from.piece)
      return null;

    // taking move
    if ((y1 - y2) === 0)
      return null;

    // destination should be null
    if (null !== to.piece)
      return null;

    // the piece we are looking for
    return new Array(x1, y2);
  };

  getOppColor = function(color) {
    return "white" == color ? "black" : "white";
  };

  movePiece = function(board, from, to, prom) {
    var hist = to.clone();
    var tmpPiece = from.piece;
    var pPiece = null;

    to.piece = from.piece;
    to.color = from.color;
    to.type = from.type;

    from.piece = null;
    from.color = null;
    from.type = null;

    // promoting the piece
    if (prom.length > 0) {
      pPiece = tmpPiece;

      switch (prom) {
      case 'R':
        to.piece = 'rook';
        break;
      case 'B':
        to.piece = 'bishop';
        break;
      case 'N':
        to.piece = 'knight';
        break;
      case 'Q':
        to.piece = 'queen';
        break;
      default:
        throw ('Unknown promotion');
      }
    }
    return new Array(from, to, hist, pPiece);
  };

  isKingChecked = function(brd, col) {
    var op = getOppColor(col);

    var x = brd.wKingX, y = brd.wKingY;
    if ("black" == col) {
      x = brd.bKingX;
      y = brd.bKingY;
    }
    // diagonals, looking for bishops, queens
    var tmp;
    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x - i][y - i];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("bishop" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }

    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x + i][y + i];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("bishop" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }

    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x + i][y - i];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("bishop" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }

    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x - i][y + i];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("bishop" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }

    // horizontals, verticals - looking for rooks and queens
    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x][y + i];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("rook" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }
    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x][y - i];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("rook" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }
    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x + i][y];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("rook" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }
    try {
      for (var i = 1; i < 7; i++) {
        tmp = brd.vBoard[x - i][y];
        if (tmp.color == col)
          break;
        if (tmp.color == op) {
          if ("rook" == tmp.piece || "queen" == tmp.piece) {
            return true;
          }
          break;
        }
      }
    } catch (e) {
    }

    return false;
  };
}

function MyMove() {
  this.actions = [];
  this.oPiece = null;
  this.oColor = null;
  // in case of promotion have to remember the prev
  // piece
  this.pPiece = null;
  //
  this.enP = null;
  //
  this.moveStr = null;

  this.add = function(action) {
    this.actions[this.actions.length] = action;
  };

  this.toString = function() {
    return "MyMove -- no. actions " + this.actions.length;
  };
}

function MySquare(x, y, piece, color) {
  this.x = x;
  this.y = y;
  this.color = color;
  this.piece = piece;

  this.toString = function() {
    return "MySquare -- x = " + this.x + " y=" + this.y + " color=" +
            this.color + " piece=" + this.piece;
  };

  this.clone = function() {
    var sq = new MySquare(this.x, this.y, this.piece, this.color);
    return sq;
  };
}

function vSquare() {
  this.piece = null;
  this.color = null;
  this.type = "";

  this.toString = function() {
    return "vSquare -- piece = " + this.piece + " color=" + this.color +
            " type=" + this.type;
  };

  this.clone = function() {
    var sq = new vSquare();
    sq.piece = this.piece;
    sq.color = this.color;
    sq.type = this.type;
    return sq;
  };
}
/**
 * Copyright 2008-2015 Toomas Römer
 * 
 * Licensed under the Apache License, Version 2.0 (the "License") you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
 * Representation of the PGN format. Different meta information about the actual
 * game(s) plus the moves and result of the game.
 */
function Pgn(pgn) {
  // properties of the game eg players, ELOs etc
  this.props = new Object();
  this.validProps = [ 'Event', 'Site', 'Date', 'Round', 'White', 'Black',
      'Result', 'FEN', 'WhiteElo', 'BlackElo', 'TimeControl' ];
  // the moves, one move contains the black and white move
  this.moves = [];
  // the current move in the game
  this.currentMove = 0;
  // for outputting white and black moves separately
  this.skip = 0;

  this.pgnOrig = pgn;

  // strip newlines
  // also strip empty lines
  // also strip lines that are single line comments
  var pgnLines = pgn.split("\n");
  var newPgnLines = Array();
  for (var i = 0; i < pgnLines.length; i++) {
    if (pgnLines[i].trim().length === 0 || pgnLines[i].trim().charAt(0) == ';')
      continue;

    newPgnLines.push(pgnLines[i]);
  }
  pgn = newPgnLines.join(" ");

  // replace dollar signs
  // "!", "?", "!!", "!?", "?!", and "??"
  pgn = pgn.replace(/\ \$1[0-9]*/g, "!");
  pgn = pgn.replace(/\ \$2[0-9]*/g, "?");
  pgn = pgn.replace(/\ \$3[0-9]*/g, "!!");
  pgn = pgn.replace(/\ \$4[0-9]*/g, "??");
  pgn = pgn.replace(/\ \$5[0-9]*/g, "!?");
  pgn = pgn.replace(/\ \$6[0-9]*/g, "?!");
  pgn = pgn.replace(/\ \$[0-9]+/g, "");

  // make double spaces to single spaces
  pgn = pgn.replace(/\s+/g, ' ');

  this.pgn = pgn;
  this.pgnRaw = pgn;
  if (isPGNBroken(pgn))
    this.pgnStripped = stripItBroken(pgn);
  else
    this.pgnStripped = stripIt(pgn);

  /* constructor */

  // strip comments
  if (isPGNBroken(pgn))
    this.pgn = stripItBroken(pgn, true);
  else
    this.pgn = stripIt(pgn, true);

  // Match all properties
  var reprop = /\[([^\]]*)\]/gi;
  var matches = this.pgn.match(reprop);
  if (matches) {
    // extract information from each matched property
    for (var i = 0; i < matches.length; i++) {
      // lose the brackets
      tmpMatches = matches[i].substring(1, matches[i].length - 1);
      // split by the first space
      var key = tmpMatches.substring(0, tmpMatches.indexOf(" "));
      var value = tmpMatches.substring(tmpMatches.indexOf(" ") + 1);
      if (value.charAt(0) == '"')
        value = value.substr(1);
      if (value.charAt(value.length - 1) == '"')
        value = value.substr(0, value.length - 1);

      this.props[key] = value;
      this.pgn = this.pgn.replace(matches[i], "");
    }
  }

  // remove the properties
  this.pgn = this.pgn.replace(/\[[^\]]*\]/g, '');
  // trim
  this.pgn = this.pgn.replace(/^\s+|\s+$/g, '');

  var gameOverre = new Array(/1\/2-1\/2/, /0-1/, /1-0/, /\*/);

  // the moves;
  var themoves = this.pgn.split(" ");
  var tmp = [];
  tmp[1] = null;
  var tmpidx = 0; // make this 1 if FEN and black to move
  if (this.props["FEN"]) {
    var fen = this.props['FEN'].split(/\/| /g);
    if (fen[8] == 'b') {
      tmpidx = 1;
      this.skip = 1;
    }
  }

  if (themoves.length > 0 && themoves[themoves.length - 1] == "...") {
    themoves = themoves.slice(0, themoves.length - 1);
  }

  var sizeOfTheMoves = themoves.length;
  if (themoves.length > 0) {
    for (var i = 0; i < gameOverre.length; i++) {
      if (themoves[themoves.length - 1].match(gameOverre[i])) {
        sizeOfTheMoves = themoves.length - 1;
        continue;
      }
    }
  }

  for (var i = 0; i < sizeOfTheMoves; i++) { // don't handle game end bit
    if (themoves[i]) {
      themoves[i] = themoves[i].replace(/^\s+|\s+$/g, '');
    }

    if (!themoves[i]) {
      continue;
    }

    if (themoves[i].indexOf("-") != -1 && !/[0|o]-[0|o]/i.test(themoves[i])
        && !/[0|o]-[0|o]-[0|o]/i.test(themoves[i])) {
      var tmp2 = themoves[i].split("-");
      var matches = tmp2[0].match(/[0-9]*?\.?([A-Z])/);
      var newMove;
      if (matches != null) {
        // we can just replace the - with nothing
        newMove = themoves[i].replace("-", "");
      } else {
        matches = tmp2[0].match(/[0-9]+\./);
        if (matches) {
          newMove = matches[0] + tmp2[1];
        } else {
          newMove = tmp2[1];
        }
      }
      themoves[i] = newMove;
    }
    var c = themoves[i].charAt(0);
    if (c >= '1' && c <= '9') { // move number
      c = themoves[i].charAt(themoves[i].length - 1);
      if (c == '.') { // ends with . so nothing but a move
        continue;
      }
      var found = false;
      for (var j = 0; j < themoves[i].length; j++) {
        c = themoves[i].charAt(j);
        if (c >= '0' && c <= '9') {
          continue;
        } else {
          found = true;
          var idx = j;
          // 6.0-0 goes wrong as 0 is used for castling
          if (!(themoves[i].charAt(j) >= '0' && themoves[i].charAt(j) <= '9')) {
            idx = j + 1;
          }
          themoves[i] = themoves[i].substring(idx); // strip move
          // number
          break;
        }
      }
      if (!found) {
        continue;
      }
    }
    tmp[tmpidx] = themoves[i];
    if (tmpidx == 1) { // black's move or last move
      var move = new Move(tmp[0], tmp[1]);
      this.moves[this.moves.length] = move;
      tmpidx = 0;
      tmp = [];
      tmp[1] = null;
    } else {
      tmpidx = 1;
    }
  }

  if (tmp[0] || tmp[1]) {
    var move = new Move(tmp[0], tmp[1]);
    this.moves[this.moves.length] = move;
  }

  this.nextMove = function() {
    var rtrn = null;
    try {
      if (this.skip) {
        this.skip = 0;
        rtrn = new Array(this.moves[this.currentMove].black, 'black');
        this.currentMove++;
      } else {
        this.skip = 1;
        rtrn = new Array(this.moves[this.currentMove].white, 'white');
      }

      if (rtrn[0] === null || rtrn[0].length === 0)
        rtrn = null;
      return rtrn;
    } catch (e) {
      return null;
    }
  };

  this.getComment = function(move, idx) {
    var i = this.pgnStripped.indexOf(move, idx);
    if (i == -1) {
      // throw("getComment error, could not find move '"
      // +move+"'"+", with index '"+idx+"'");
      return [ null, idx ];
    }

    for (var j = i + move.length; j < this.pgnStripped.length; j++) {
      var c = this.pgnStripped.charAt(j);
      switch (c) {
      case ' ':
        break;
      case '_': // found comment
        for (var k = j; k < this.pgnStripped.length; k++) {
          var c2 = this.pgnStripped.charAt(k);
          switch (c2) {
          case '_': // found comment
            break;
          default: // no comment
            // we might have many comments separated with spaces
            // as we strip all double spaces to single ones we
            // can just check for the next char being '_'
            if (this.pgnStripped.length > k + 1
                && this.pgnStripped.charAt(k + 1) == '_') {
              continue;
            }
            return [ this.pgnRaw.substring(j, k), k ];
          }
        }
        break;
      default: // no comment
        return [ null, idx ];
      }
    }
    return [ null, idx ];
  };
};

function Move(white, black) {
  this.white = white;
  this.black = black;

  this.toString = function() {
    return this.white + " " + this.black;
  };
};

/*
 * Strip game comments from a PGN string. If second parameter set false true
 * then comments will be replaced by an underscore.
 */
function stripIt(val, strip) {
  var count = 0;
  var out = [];
  for (var i = 0; i < val.length; i++) {
    var c = val.charAt(i);
    switch (c) {
    case '(':
      if (!strip) {
        out[out.length] = '_';
      }
      count++;
      break;
    case '{':
      if (!strip) {
        out[out.length] = '_';
      }
      count++;
      break;
    case '}':
      count--;
      if (!strip) {
        out[out.length] = '_';
      }
      break;
    case ')':
      count--;
      if (!strip) {
        out[out.length] = '_';
      }
      break;
    case '\t':
      out[out.length] = ' ';
      break;
    default:
      if (count > 0) {
        if (!strip) {
          out[out.length] = '_';
        }
      } else {
        out[out.length] = c;
      }
    }
  }
  return out.join("");
};

function isPGNBroken(val) {
  var pCount = 0;
  var cCount = 0;
  var lastOne = "";
  for (var i = 0; i < val.length; i++) {
    var c = val.charAt(i);
    switch (c) {
    case '(':
      pCount++;
      lastOne = "p";
      break;
    case ')':
      // closing a non-existent curly brace
      if (pCount === 0)
        return false;
      // closing a curly instead of a parenthesis
      if (lastOne == "c")
        return false;
      lastOne = "";
      pCount--;
      break;
    case '{':
      cCount++;
      lastOne = "c";
      break;
    case '}':
      // closing a non-existent curly brace
      if (cCount === 0)
        return false;
      // if we're closing a parenthesis instead of a curly
      if (lastOne == "p")
        return false;
      lastOne = "";
      cCount--;
      break;
    }
  }
}

function stripItBroken(val, strip) {
  var count = 0;
  var out = [];
  /*
   * At one point chesspastebin.com started getting cames with invalid PGNs,
   * mostly in the form { comment comment ( something between starting
   * brackets}. As you can see, the ( is not closed. isOpen and isCurlyO are
   * just for that to take normal guesses in that kind of situations.
   */
  var isOpen = false;
  var isCurlyO = false;
  var curlyOpenedFst = false;
  for (var i = 0; i < val.length; i++) {
    var c = val.charAt(i);
    switch (c) {
    case '(':
      if (!strip) {
        out[out.length] = '_';
      }
      count++;
      if (isOpen) {
        count--;
      }
      isOpen = true;
      break;
    case '{':
      isCurlyO = true;
      if (!strip) {
        out[out.length] = '_';
      }
      count++;
      if (!isOpen)
        curlyOpenedFst = true;
      break;
    case '}':
      if (isOpen && isCurlyO && curlyOpenedFst) {
        // lets close the open (
        count--;
        isOpen = false;
      }
      isCurlyO = false;
      curlyOpenedFst = false;
      count--;
      if (!strip) {
        out[out.length] = '_';
      }
      break;
    case ')':
      if (isOpen) {
        count--;
        if (!strip) {
          out[out.length] = '_';
        }
        isOpen = false;
      }
      break;
    case '\t':
      out[out.length] = ' ';
      break;
    default:
      if (count > 0) {
        if (!strip) {
          out[out.length] = '_';
        }
      } else {
        out[out.length] = c;
      }
    }
  }
  return out.join("");
};
/**
 * Copyright 2008-2015 Toomas Römer
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
 * Representation of the Yahoo game format.
 */
function Yahoo(pgn) {
  // properties of the game eg players, ELOs etc
  this.props = {};
  this.validProps = [ 'Title', 'White', 'Black', 'Date' ];

  // the moves, one move contains the black and white move
  this.moves = new Array();
  // the current move in the game
  this.currentMove = 0;
  // for outputting white and black moves separately
  this.skip = 0;

  // strip newlines
  this.pgnOrig = pgn;

  // make double spaces to single spaces
  pgn = pgn.replace(/ +/g, ' ');

  this.pgn = pgn;
  this.pgnRaw = pgn;
  this.pgnStripped = pgn;

  /* constructor */

  // Match all properties
  var reprop = /;.*/gi;
  var matches = this.pgn.match(reprop);

  if (matches) {
    // extract information from each matched property
    for (var i = 0; i < matches.length; i++) {
      if (matches[i].length == 0)
        continue;
      var tmp = matches[i];
      tmp = tmp.split(":");
      if (tmp.length == 2) {
        key = tmp[0].replace(/^\s+|\s+$/g, '').replace(/^;/, '');
        value = tmp[1].replace(/^\s+|\s+$/g, '');
        this.props[key] = value;
      }
    }
  }

  // remove the properties
  this.pgn = this.pgn.replace(/;.*/gi, '');

  // trim
  this.pgn = this.pgn.replace(/^\s+|\s+$/g, '');
  // new lines
  this.pgn = this.pgn.replace(/\n/g, " ");

  var gameOverre = new Array(/1\/2-1\/2/, /0-1/, /1-0/, /\*/);

  var elems = this.pgn.split(" ");
  var tmpMove = new Array();
  for (var i = 0; i < elems.length; i++) {
    if (elems[i].length == 0)
      continue;
    // we can skip elements that are just move numbers
    if (elems[i].indexOf(".") != -1)
      continue;

    // depending on parity we either have a full move
    // or the last one is a half move
    if (tmpMove.length == 2) {
      var move = new Move(tmpMove[0], tmpMove[1]);
      this.moves[this.moves.length] = move;
      tmpMove = new Array();
    }
    tmpMove[tmpMove.length] = elems[i];
  }

  if (tmpMove.length > 0) {
    var move = new Move(tmpMove[0], tmpMove[1]);
    this.moves[this.moves.length] = move;
  }

  this.nextMove = function() {
    var rtrn = null;
    try {
      if (this.skip) {
        this.skip = 0;
        rtrn = new Array(this.moves[this.currentMove].black, 'black');
        this.currentMove++;
      } else {
        this.skip = 1;
        rtrn = new Array(this.moves[this.currentMove].white, 'white');
      }

      if (rtrn[0] == null || rtrn[0].length == 0)
        rtrn = null;
      return rtrn;
    } catch (e) {
      return null;
    }
  };

  this.getComment = function(move, idx) {
    var i = this.pgnStripped.indexOf(move, idx);
    if (i == -1) {
      // throw("getComment error, could not find move '"
      // +move+"'"+", with index '"+idx+"'");
      return [ null, idx ];
    }

    for (var j = i + move.length; j < this.pgnStripped.length; j++) {
      var c = this.pgnStripped.charAt(j);
      switch (c) {
      case ' ':
        break;
      case '_': // found comment
        for (var k = j; k < this.pgnStripped.length; k++) {
          var c2 = this.pgnStripped.charAt(k);
          switch (c2) {
          case '_': // found comment
            break;
          default: // no comment
            // we might have many comments separated with spaces
            // as we strip all double spaces to single ones we
            // can just check for the next char being '_'
            if (this.pgnStripped.length > k + 1
                && this.pgnStripped.charAt(k + 1) == '_') {
              continue;
            }
            return [ this.pgnRaw.substring(j, k), k ];
          }
        }
        break;
      default: // no comment
        return [ null, idx ];
      }
    }
    return [ null, idx ];
  };
};

function Move(white, black) {
  this.white = white;
  this.black = black;

  this.toString = function() {
    return this.white + " " + this.black;
  };
};
/**
 * Copyright 2008-2015 Toomas Römer
 *
 * Licensed under the Apache License, Version 2.0 (the "License") you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

function Board(divId, options) {
  var pgn = null;
  if (isYahoo(document.getElementById(divId).firstChild.nodeValue))
    /*global Yahoo */
    pgn = new Yahoo(document.getElementById(divId).firstChild.nodeValue);
  else
    /*global PGN */
    pgn = new Pgn(document.getElementById(divId).firstChild.nodeValue);

  this.conv = new Converter(pgn);
  this.conv.convert();
  this.movesOnPane = [];

  this.flipped = false;
  this.id = (new Date()).getTime();
  window[this.id] = this;
  if (!options)
    options = {};
  this.moveInput = null;
  this.lastBold = null;
  this.lastBoldIdx = null;
  this.lastSquare = null;
  this.visuals = {
    "pgn" : {}
  };

  this.opts = [];
  this.opts['root'] = detectRoot();
  this.opts['imagePrefix'] = "img/zurich/";
  this.opts['buttonPrefix'] = "img/zurich/buttons/";
  this.opts['imageSuffix'] = 'gif';
  this.opts['moveFontSize'] = "8pt";
  this.opts['moveFontColor'] = "#af0000";
  this.opts['moveFont'] = 'Tahoma, Arial, sans-serif';
  this.opts['background'] = '#fff';

  this.opts['commentFontSize'] = "8pt";
  this.opts['commentFontColor'] = "#006699";
  this.opts['commentFont'] = 'Tahoma, Arial, sans-serif';

  this.opts['boardSize'] = '257px';
  this.opts['squareSize'] = '31px';

  this.opts['flipped'] = false;
  this.opts['showMovesPane'] = true;

  this.opts['showComments'] = true;
  this.opts['markLastMove'] = false;

  this.opts['altRewind'] = "Rewind to the beginning";
  this.opts['altBack'] = "One move back";
  this.opts['altFlip'] = "Flip the board";
  this.opts['altShowMoves'] = "Show moves pane";
  this.opts['altComments'] = "Show comments";
  this.opts['altPlayMove'] = "Play one move";
  this.opts['altFastForward'] = "Fast-forward to the end";
  this.opts['downloadURL'] = "http://www.chesspastebin.com/asPgn.php?PGN=";
  this.opts['skipToMove'] = null;

  var optionNames = [ 'root', 'flipped', 'moveFontSize', 'moveFontColor', 'moveFont',
      'commentFontSize', 'commentFontColor', 'commentFont', 'boardSize',
      'squareSize', 'blackSqColor', 'whiteSqColor', 'imagePrefix',
      'showMovesPane', 'movesPaneWidth', 'imageSuffix', 'comments',
      'squareBorder', 'markLastMove', 'altRewind', 'altBack', 'altFlip',
      'altShowMoves', 'altComments', 'altPlayMove', 'altFastForward',
      'moveBorder', 'skipToMove', 'downloadURL', 'buttonPrefix', 'background' ];

  // if keys in options define new values then
  // set the this.opts for that key with the
  // custom value
  for (var i = 0; i < optionNames.length; i++) {
    if (options && typeof (options[optionNames[i]]) != 'undefined') {
      this.opts[optionNames[i]] = options[optionNames[i]];
    }
  }

  this.opts['imagePrefix'] = this.opts['root'] + this.opts['imagePrefix'];

  // have to have the defaults after imageprefix is properly rooted
  if(!this.opts['blackSqColor']) {
    this.opts['blackSqColor'] = "url('"+this.opts['imagePrefix']+"board/darksquare.gif')";
  }

  if(!this.opts['whiteSqColor']) {
    this.opts['whiteSqColor'] = "url('"+this.opts['imagePrefix']+"board/lightsquare.gif')";
  }

  if(!this.opts['squareBorder']) {
    this.opts['squareBorder'] = "0px solid #000000";
  }

  if(!this.opts['moveBorder']) {
    this.opts['moveBorder'] = "1px solid #cccccc";
  }

  if (options && typeof (options['buttonPrefix']) == 'undefined')
    this.opts['buttonPrefix'] = this.opts['imagePrefix'] + "buttons/";

  var brdI = new BoardImages(this.opts);
  var imageNames = brdI.imageNames['default'];
  brdI = null;
  // end of static
  this.pos = [];

  for (var i = 0; i < 8; i++)
    this.pos[i] = [];

  this.init = function() {
    // the main frame
    var boardFrame = document.getElementById(divId + "_board");

    var mainTable = resetStyles(document.createElement("table"));
    mainTable.border = 0;
    var mainTableTb = document.createElement("tbody");
    mainTable.appendChild(mainTableTb);
    mainTable.style.border = "1px solid #000000";
    var tmp = document.createElement("tr");
    tmp.style.background = this.opts['background'];
    mainTableTb.appendChild(tmp);
    var topLeftTd = resetStyles(document.createElement("td"));
    topLeftTd.vAlign = "top";
    topLeftTd.style.width = this.opts['boardSize'];
    tmp.appendChild(topLeftTd);
    var topRightTd = resetStyles(document.createElement("td"));
    topRightTd.style.verticalAlign = "top";
    tmp.appendChild(topRightTd);

    // toplevel table;
    var topTable = resetStyles(document.createElement("table"));
    topTable.style.width = parseInt(this.opts['boardSize']) + "px";
    topTable.style.height = parseInt(this.opts['boardSize']) + "px";
    topLeftTd.appendChild(topTable);
    topTable.border = 0;
    var topTableTb = document.createElement("tbody");
    topTable.appendChild(topTableTb);

    var boardTd = resetStyles(document.createElement("td"));
    boardTd.style.width = this.opts['boardSize'];
    boardTd.style.height = this.opts['boardSize'];
    boardTd.vAlign = "top";
    var btnTdNext = resetStyles(document.createElement("td"));
    btnTdNext.vAlign = 'top';
    btnTdNext.align = 'center';
    btnTdNext.style.height = '10px';
    var btnTd = resetStyles(document.createElement("td"));
    btnTd.vAlign = 'top';
    btnTd.style.height = '10px';
    var propsTd = resetStyles(document.createElement("td"));
    propsTd.style.height = '10px';

    // movesTable
    var movesDiv = resetStyles(document.createElement("div"));
    this.movesDiv = movesDiv;
    if (this.opts['movesPaneWidth'])
      movesDiv.style.width = this.opts['movesPaneWidth'];
    // else
    // movesDiv.style.overflow = "hidden";
    movesDiv.style.height = boardTd.style.height;
    movesDiv.id = divId + "_board_moves";
    movesDiv.style.overflow = "auto";
    movesDiv.style.border = "1px solid #cccccc";
    movesDiv.style.verticalAlign = "top";
    movesDiv.style.textAlign = "left";
    movesDiv.style.paddingLeft = "5px";
    movesDiv.style.paddingTop = "5px";
    topRightTd.appendChild(movesDiv);

    var tmp = document.createElement("tr");
    tmp.style.height = "0%";
    tmp.appendChild(boardTd);
    topTableTb.appendChild(tmp);

    topTableTb.appendChild(document.createElement("tr")).appendChild(btnTd);
    topTableTb.appendChild(document.createElement("tr")).appendChild(btnTdNext);
    topTableTb.appendChild(document.createElement("tr")).appendChild(propsTd);
    tmp = resetStyles(document.createElement("td"));
    var tmpStr = document.createTextNode("");
    tmp.style.height = "auto";
    tmp.appendChild(tmpStr);
    topTableTb.appendChild(document.createElement("tr")).appendChild(tmp);

    var board = resetStyles(document.createElement("table"));
    var boardTb = document.createElement("tbody");
    board.appendChild(boardTb);

    board.style.top = boardFrame.style.top;
    board.style.left = boardFrame.style.left;
    board.style.borderCollapse = "collapse";

    boardFrame.appendChild(mainTable);
    boardTd.appendChild(board);

    var whiteC = this.opts['whiteSqColor'];
    var blackC = this.opts['blackSqColor'];

    // white pieces
    for (var i = 0; i < 8; i++) {
      var tr = document.createElement("tr");
      tr.style.height = (parseInt(this.opts['squareSize'].replace("px", "")) + 1) + "px";
      var flip = (i % 2) ? 1 : 0;
      for (var j = 0; j < 8; j++) {
        var td = resetStyles(document.createElement("td"));

        td.style.height = this.opts['squareSize'];
        td.style.width = this.opts['squareSize'];
        td.style.border = this.opts['squareBorder'];
        td.style.padding = "0px";
        td.vAlign = "middle";
        td.align = "center";
        var color = !flip ? (j % 2) ? blackC : whiteC : !(j % 2) ? blackC: whiteC;

        td.style.background = color;

        this.pos[i][j] = td;
        tr.appendChild(td);
      }
      boardTb.appendChild(tr);
    }
    this.populatePieces();
    if (this.opts['flipped'])
      flipBoard(this);
    this.populateProps(propsTd);
    this.populateMoves(movesDiv, pgn.pgnOrig);

    // in java i could do Board.this in anon function;
    var tmp = this;
    // button td
    btnTd.align = 'center';
    btnTd.valign = 'middle';

    // rwnd;
    var hrefS = document.createElement("a");
    hrefS.href = "javascript:void(0)";
    var href = hrefS.cloneNode(false);
    var input = this.getImg("rwind", "btns");
    input.alt = this.opts['altRewind'];
    input.title = this.opts['altRewind'];

    href.appendChild(input);

    input.onclick = function() {
      startPosition(tmp);
    };
    btnTd.appendChild(href);

    // back
    input = this.getImg("back", "btns");
    input.alt = this.opts['altBack'];
    input.title = this.opts['altBack'];
    href = hrefS.cloneNode(false);
    href.appendChild(input);

    input.onclick = function() {
      makeBwMove(tmp);
    };

    btnTd.appendChild(href);

    // flip the board
    input = this.getImg("flip", "btns");
    input.alt = this.opts['altFlip'];
    input.title = this.opts['altFlip'];
    href = hrefS.cloneNode(false);
    href.appendChild(input);

    input.onclick = function() {
      flipBoard(tmp);
    };

    btnTd.appendChild(href);

    // current move
    // it is initialized in updateMoveInfo
    var input = resetStyles(document.createElement("input"));
    input.style.fontSize = "7pt";
    input.size = "9";
    input.style.border = this.opts['moveBorder'];
    input.style.textAlign = 'center';
    this.moveInput = input;
    btnTdNext.appendChild(input);
    // end of current move

    // hide
    input = this.getImg("toggle", "btns");
    input.alt = this.opts['altShowMoves'];
    input.title = this.opts['altShowMoves'];
    href = hrefS.cloneNode(false);
    href.appendChild(input);

    input.onclick = function() {
      toggleMoves(tmp, "flip");
    };

    btnTd.appendChild(href);

    // comments
    input = this.getImg("comments", "btns");
    input.alt = this.opts['altComments'];
    input.title = this.opts['altComments'];
    href = hrefS.cloneNode(false);
    href.appendChild(input);

    input.onclick = function() {
      toggleComments(tmp, "flip");
    };

    btnTd.appendChild(href);

    // next btn
    input = this.getImg("forward", "btns");
    input.alt = this.opts['altPlayMove'];
    input.title = this.opts['altPlayMove'];
    href = hrefS.cloneNode(false);
    href.appendChild(input);

    input.onclick = function() {
      makeMove(tmp);
    };

    btnTd.appendChild(href);

    // ffwd
    input = this.getImg("ffward", "btns");
    input.alt = this.opts['altFastForward'];
    input.title = this.opts['altFastForward'];
    href = hrefS.cloneNode(false);
    href.appendChild(input);

    input.onclick = function() {
      endPosition(tmp);
    };
    btnTd.appendChild(href);
    updateMoveInfo(this);
    this.toggleMoves(this.opts['showMovesPane']); // force the moves pane
    // overflow to get
    // picked up
    if (this.opts['skipToMove']) {
      try {
        var tmp2 = parseInt(this.opts['skipToMove']);
        if (tmp2 > 2) {
          var color2 = tmp2 % 2 === 0 ? 1 : 0;
          tmp2 = Math.round(tmp2 / 2);
          this.skipToMove(tmp2 - 1, color2);
        } else if (tmp2 == 1) {
          this.skipToMove(0, 0);
        } else if (tmp2 == 2) {
          this.skipToMove(0, 1);
        }
      } catch (e) {
      }
    }
  };

  flipBoard = function(board) {
    board.deMarkLastMove(true);
    var frst, snd, tmp;
    board.flipped = !board.flipped;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 4; j++) {
        frst = board.pos[i][j];
        snd = board.pos[7 - i][7 - j];

        try {
          tmp = frst.removeChild(frst.firstChild);
        } catch (e) {
          tmp = null;
        }

        try {
          frst.appendChild(snd.removeChild(snd.firstChild));
        } catch (e) {
        }

        if (tmp)
          snd.appendChild(tmp);
      }
    }
  };

  this.skipToMove = function(no, color) {
    var rNo = no * 2 + color + 1;
    if (this.conv.getCurMoveNo() < rNo) {
      var i = 0;
      while (this.conv.getCurMoveNo() < rNo && i < 400) {
        makeMove(this, true);
        i++;
      }
      updateMoveInfo(this);
      updateMovePane(this);
      this.deMarkLastMove();
      this.markLastMove();
    } else if (this.conv.getCurMoveNo() > rNo) {
      var i = 0;
      while (this.conv.getCurMoveNo() > rNo && i < 200) {
        makeBwMove(this, true);
        i++;
      }

      updateMoveInfo(this);
      updateMovePane(this);
      this.deMarkLastMove();
      this.markLastMove();
    }
  };

  endPosition = function(board) {
    board.deMarkLastMove();
    var vBoard = board.conv.getEndPos(board.flipped);
    board.syncBoard(vBoard);

    board.conv.resetToEnd();
    updateMoveInfo(board);
    updateMovePane(board, true);
    board.markLastMove();
  };

  this.startPosition = function() {
    startPosition(this);
  };

  startPosition = function(board) {
    board.deMarkLastMove(true);
    var vBoard = board.conv.getStartPos(board.flipped);
    board.syncBoard(vBoard);
    board.conv.resetToStart();
    updateMoveInfo(board);
    updateMovePane(board);
  };

  makeBwMove = function(board, noUpdate) {
    var move = board.conv.prevMove();
    if (move == null)
      return;

    if (!noUpdate) {
      board.deMarkLastMove(true);
      board.markLastMove();
      updateMoveInfo(board);
      updateMovePane(board, true);
    }

    for (var i = move.actions.length; i > 1; i -= 2) {
      var frst = move.actions[i - 1].clone();
      var snd = move.actions[i - 2].clone();
      var tmpM = new MySquare();
      tmpM.piece = frst.piece;
      tmpM.color = frst.color;
      frst.piece = snd.piece;
      frst.color = snd.color;
      snd.piece = tmpM.piece;
      snd.color = tmpM.color;

      frst.piece = move.oPiece;
      frst.color = move.oColor;

      if (move.pPiece)
        snd.piece = move.pPiece;

      board.drawSquare(frst);
      board.drawSquare(snd);
    }
    if (move.enP) {
      var x = move.enP.x, y = move.enP.y;
      if (board.flipped) {
        x = 7 - x;
        y = 7 - y;
      }
      var sq = board.pos[x][y];
      sq.appendChild(board.getImg(move.enP.piece, move.enP.color));
    }
  };

  this.markLastMove = function() {
    if (!this.opts['markLastMove'])
      return;
    try {
      var move = this.conv.moves[this.conv.iteIndex - 1].actions[1];

      var piece = this.pos[move.x][move.y];
      if (this.flipped) {
        piece = this.pos[7 - move.x][7 - move.y];
      }
      // on konq the bg contains "initial initial initial "
      // i guess xtra information. Anyways setting the
      // background to a color containing the "initial"
      // parts fails. Go figure
      piece.lastBg = piece.style.backgroundColor.replace(/initial/g, "");
      piece.style.backgroundColor = "#e89292";
      this.lastSquare = piece;
    } catch (e) {
    }
  };

  this.deMarkLastMove = function() {
    var move = this.conv.moves[this.conv.iteIndex - 2];
    if (arguments.length && arguments[0]) {
      move = this.conv.moves[this.conv.iteIndex - 1];
    }

    if (this.conv.iteIndex + 1 == this.conv.moves.length)
      move = this.conv.getCurMove();

    if (move) {
      move = move.actions[1];

      var piece = this.pos[move.x][move.y];
      if (this.flipped)
        piece = this.pos[7 - move.x][7 - move.y];
      if (piece.lastBg)
        piece.style.background = piece.lastBg;
    }
    if (this.lastSquare && this.lastSquare.lastBg) {
      this.lastSquare.style.backgroundColor = this.lastSquare.lastBg;
      this.lastSquare = null;
    }
  };

  /*
   * Toggle moves pane, actually not toggle but showing it depending the 'flag'.
   */
  this.toggleMoves = function(flag) {
    if (flag == "flip")
      flag = this.movesDiv.style.visibility == "hidden";
    if (flag) {
      this.movesDiv.style.display = "block";
      this.movesDiv.style.visibility = "visible";
    } else {
      this.movesDiv.style.display = "none";
      this.movesDiv.style.visibility = "hidden";
    }
  };

  this.toggleComments = function(flag) {
    if (flag == "flip")
      flag = !this.opts['showComments'];
    if (flag) {
      this.opts['showComments'] = true;
    } else {
      this.opts['showComments'] = false;
    }
    var list = this.movesDiv.getElementsByTagName("span");
    if (list) {
      for (var i = 0; i < list.length; i++) {
        if (flag) {
          list[i].style.display = "inline";
        } else {
          list[i].style.display = "none";
        }
      }
    }
  };

  /*
   * Non-member toggle function. The onClick that I'm setting must not be a
   * member function. I'm just using it to proxy.
   */
  toggleMoves = function(board, flag) {
    board.toggleMoves(flag);
  };

  toggleComments = function(board, flag) {
    board.toggleComments(flag);
  };

  updateMoveInfo = function(board) {
    var idx = board.conv.getCurMoveNo() - 1;
    // if (board.conv.getCurMoveNo() == board.conv.moves.length-1)
    // idx = board.conv.getCurMoveNo();
    var move = board.conv.moves[idx];
    if (move && move.moveStr) {
      var str = Math.floor((idx == 0 ? 1 : idx) / 2 + 1) + ". " + move.moveStr;
      board.moveInput.value = str;
    } else
      board.moveInput.value = "...";
  };

  makeMove = function(board, noUpdate) {
    var move = board.conv.nextMove();
    if (move == null)
      return;

    if (!noUpdate) {
      board.deMarkLastMove();
      board.markLastMove();

      updateMoveInfo(board);
      updateMovePane(board);
    }

    for (var i = 0; i < move.actions.length; i++) {
      board.drawSquare(move.actions[i]);
    }

    board.drawEnPassante(move);
  };

  updateMovePane = function(board, bw) {
    // highlight the move in the move's pane
    var idx = board.conv.getCurMoveNo();
    board.movesOnPane[this.lastBoldIdx] = deMakeBold(this.lastBold);
    // if (bw)
    // idx+=1;
    this.lastBold = null;
    this.lastBoldIdx = null;
    if (board.movesOnPane[idx - 1]) {
      board.movesOnPane[idx - 1] = makeBold(board.movesOnPane[idx - 1]);
      this.lastBold = board.movesOnPane[idx - 1];
      this.lastBoldIdx = idx - 1;
    }
  };

  makeBold = function(el) {
    var b = document.createElement("b");
    b.appendChild(el.cloneNode(true));
    el.parentNode.replaceChild(b, el);
    return b;
  };

  deMakeBold = function(el) {
    if (!el)
      return;
    var rtrn = el.firstChild.cloneNode(true);
    el.parentNode.replaceChild(rtrn, el);
    return rtrn;
  };

  this.drawEnPassante = function(move) {
    if (!move.enP)
      return;
    var x = move.enP.x, y = move.enP.y;
    if (this.flipped) {
      x = 7 - x;
      y = 7 - y;
    }
    var sq = this.pos[x][y];

    sq.color = null;
    sq.piece = null;

    sq.removeChild(sq.firstChild);
  };

  this.drawSquare = function(square) {
    var x = square.x, y = square.y;
    if (this.flipped) {
      x = 7 - x;
      y = 7 - y;
    }
    var sq = this.pos[x][y];

    sq.color = square.color;
    sq.piece = square.piece;

    if (sq.firstChild)
      sq.removeChild(sq.firstChild);

    if (sq.piece) {
      sq.appendChild(this.getImg(sq.piece, sq.color));
    }
  };

  this.updatePGNInfo = function() {
    this.visuals['pgn']['players'].nodeValue = ' ';
    this.visuals['pgn']['elos'].nodeValue = ' ';
    this.visuals['pgn']['event'].nodeValue = ' ';
    this.visuals['pgn']['timecontrol'].nodeValue = ' ';
    if (this.conv.pgn.props['White']) {
      this.visuals['pgn']['players'].nodeValue = this.conv.pgn.props['White'];
    }
    if (this.conv.pgn.props['White'] || this.conv.pgn.props['Black'])
      this.visuals['pgn']['players'].nodeValue += " - ";

    if (this.conv.pgn.props['Black']) {
      this.visuals['pgn']['players'].nodeValue += this.conv.pgn.props['Black'];
    }

    if (this.conv.pgn.props['WhiteElo']) {
      this.visuals['pgn']['elos'].nodeValue = this.conv.pgn.props['WhiteElo'];
    }
    if (this.conv.pgn.props['WhiteElo'] || this.conv.pgn.props['BlackElo'])
      this.visuals['pgn']['elos'].nodeValue += " - ";
    if (this.conv.pgn.props['BlackElo']) {
      this.visuals['pgn']['elos'].nodeValue += this.conv.pgn.props['BlackElo'];
    }
    if (this.conv.pgn.props['Event']) {
      this.visuals['pgn']['event'].nodeValue = this.conv.pgn.props['Event'];
    }
    if (this.conv.pgn.props['Date']) {
      this.visuals['pgn']['event'].nodeValue += ", " + this.conv.pgn.props['Date'];
    }
    if (this.conv.pgn.props['TimeControl']) {
      this.visuals['pgn']['timecontrol'].nodeValue = this.conv.pgn.props['TimeControl'];
    }
  };

  this.updateSettings = function() {
    var blacks = this.opts['blackSqColor'];
    var whites = this.opts['whiteSqColor'];

    for (var i = 0; i < 8; i++) {
      var flip = (i % 2) ? true : false;
      for (var j = 0; j < 8; j++) {
        var color = flip ? (j % 2) ? whites : blacks : !(j % 2) ? whites
            : blacks;
        this.pos[i][j].style.background = color;
      }
    }
  };

  /*
   * Draw the board with all the pieces in the initial position
   */
  this.populatePieces = function() {
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var p = this.conv.initialBoard[r][f];
        if (p.piece) {
          var img = this.getImg(p.piece, p.color);
          this.pos[r][f].appendChild(img);
          this.pos[r][f].piece = p.piece;
          this.pos[r][f].color = p.color;
        }
      }
    }
  };

  this.populateMoves = function(cont, pgn) {
    if (!this.opts['showMovesPane']) {
      cont.style.visibility = "hidden";
      cont.style.display = "none";
    }
    cont.vAlign = "top";
    var tmp2 = this.conv.pgn.moves;
    var p = document.createElement("p");
    p.style.fontSize = "9pt";
    p.style.fontFace = "Tahoma, Arial, sans-serif";
    p.style.fontWeight = "bold";
    p.style.color = "#000000";
    var tmpA = document.createElement("a");

    tmpA.href = this.opts['downloadURL'] + escape(pgn);
    tmpA.appendChild(document.createTextNode("PGN"));
    tmpA.style.fontFamily = this.opts['moveFont'];
    tmpA.style.fontSize = this.opts['moveFontSize'];
    tmpA.style.color = this.opts['moveFontColor'];

    var txt = document.createTextNode("");
    if (this.conv.pgn.props['White']) {
      var txt = document.createTextNode(this.conv.pgn.props['White'] + " - "
          + this.conv.pgn.props['Black']);
      p.appendChild(txt);
    } else {
      var txt = document.createTextNode("Unknown - Unknown");
      p.appendChild(txt);
    }
    p.appendChild(document.createTextNode(" ("));
    p.appendChild(tmpA);
    p.appendChild(document.createTextNode(")"));
    cont.appendChild(p);

    var link, tmp, tmp3;
    var lastMoveIdx = 0;
    var comment;

    for (var i = 0; i < tmp2.length; i++) {
      if (tmp2[i].white != null) {
        link = resetStyles(document.createElement("a"));
        tmp = document.createTextNode(tmp2[i].white);
        tmp3 = document.createElement("b");

        tmp3.style.fontFamily = "Tahoma, Arial, sans-serif";
        tmp3.style.fontSize = "8pt";
        tmp3.style.color = "black";
        tmp3.appendChild(document.createTextNode(" "
            + (i + this.conv.startMoveNum) + ". "));
        cont.appendChild(tmp3);

        link.href = 'javascript:void(window[' + this.id + ']' + '.skipToMove('
            + i + ',' + 0 + '))';
        link.appendChild(tmp);
        link.style.fontFamily = this.opts['moveFont'];
        link.style.fontSize = this.opts['moveFontSize'];
        link.style.color = this.opts['moveFontColor'];
        link.style.textDecoration = "none";
        cont.appendChild(link);

        comment = this.conv.pgn.getComment(tmp2[i].white, lastMoveIdx);
        if (comment[0]) {
          var tmp4 = document.createElement("span");
          if (!this.opts['showComments']) {
            tmp4.style.display = "none";
          }
          tmp4.style.fontFamily = this.opts['commentFont'];
          tmp4.style.fontSize = this.opts['commentFontSize'];
          tmp4.style.color = this.opts['commentFontColor'];
          tmp4.appendChild(document.createTextNode(" "+comment[0]));
          cont.appendChild(tmp4);
          lastMoveIdx = comment[1];
        }

        this.movesOnPane[this.movesOnPane.length] = link;
      }

      if (tmp2[i].black != null) {
        cont.appendChild(document.createTextNode(" "));
        tmp = document.createTextNode(tmp2[i].black);
        link = resetStyles(document.createElement("a"));
        link.style.fontFamily = this.opts['moveFont'];
        link.style.fontSize = this.opts['moveFontSize'];
        link.style.color = this.opts['moveFontColor'];
        link.style.textDecoration = "none";
        link.appendChild(tmp);
        link.href = 'javascript:void(window[' + this.id + ']' + '.skipToMove('
            + i + ',' + 1 + '))';
        cont.appendChild(link);
        comment = this.conv.pgn.getComment(tmp2[i].black, lastMoveIdx);
        if (comment[0]) {
          var tmp4 = document.createElement("span");
          if (!this.opts['showComments']) {
            tmp4.style.display = "none";
          }
          tmp4.style.fontFamily = this.opts['commentFont'];
          tmp4.style.fontSize = this.opts['commentFontSize'];
          tmp4.style.color = this.opts['commentFontColor'];
          tmp4.appendChild(document.createTextNode(" "+comment[0]));
          cont.appendChild(tmp4);
          lastMoveIdx = comment[1];
        }
        this.movesOnPane[this.movesOnPane.length] = link;
      }
    }
    if (!(typeof (this.conv.pgn.props['Result']) == 'undefined')) {
      txt = document.createTextNode("  " + this.conv.pgn.props['Result']);
      tmp2 = document.createElement("b");
      tmp2.appendChild(txt);
      tmp2.style.fontSize = "9pt";
      cont.appendChild(tmp2);
      this.movesOnPane[this.movesOnPane.length] = tmp2;
    }
  };

  this.populateProps = function(container) {
    // init the style
    var tdS = resetStyles(document.createElement('td'));
    tdS.style.fontFamily = "Tahoma, Arial, sans-serif";
    tdS.style.fontSize = "8pt";
    tdS.align = 'center';
    // end of init the style;

    var tbl = resetStyles(document.createElement('table'));
    tbl.cellPadding = "0";
    tbl.cellSpacing = "0";
    var tblTb = document.createElement("tbody");
    tbl.appendChild(tblTb);

    tbl.width = "100%";
    container.appendChild(tbl);

    // white - black;
    var tr = document.createElement('tr');
    tblTb.appendChild(tr);

    var td = tdS.cloneNode(true);
    td.style.fontWeight = "bold";
    tr.appendChild(td);

    var txt = document.createTextNode('&nbsp;');
    this.visuals['pgn']['players'] = txt;
    td.appendChild(txt);
    //

    // ELO
    tr = document.createElement('tr');
    tblTb.appendChild(tr);

    td = tdS.cloneNode(false);
    tr.appendChild(td);

    txt = document.createTextNode('&nbsp;');
    this.visuals['pgn']['elos'] = txt;
    td.appendChild(txt);
    //

    // Date
    tr = document.createElement('tr');
    tblTb.appendChild(tr);

    td = tdS.cloneNode(false);
    tr.appendChild(td);

    txt = document.createTextNode('&nbsp;');
    this.visuals['pgn']['event'] = txt;
    td.appendChild(txt);

    // Time control
    tr = document.createElement('tr');
    tblTb.appendChild(tr);

    td = tdS.cloneNode(false);
    tr.appendChild(td);

    txt = document.createTextNode('&nbsp;');
    this.visuals['pgn']['timecontrol'] = txt;
    td.appendChild(txt);
    this.updatePGNInfo();
  };

  this.getImg = function(piece, color) {
    var btns = {
      "ffward" : true,
      "rwind" : true,
      "forward" : true,
      "back" : true,
      "toggle" : true,
      "comments" : true,
      "flip" : true
    };

    var prefix = this.opts['imagePrefix'];
    if (btns[piece]) {
      prefix = this.opts['buttonPrefix'];
      imageNames[color][piece] = imageNames[color][piece].replace("buttons\/",
          "");
    }

    var src = prefix + imageNames[color][piece];
    var img = resetStyles(document.createElement("img"));
    img.style.border = "0px solid #cccccc";
    img.style.display = "inline";

    if (/\.png$/.test(img.src.toLowerCase())
        && navigator.userAgent.toLowerCase().indexOf("msie") != -1) {
      // set filter
      img.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src='"
          + src + "',sizingMethod='image')";
    } else {
      img.src = src;
    }

    return img;
  };

  this.syncBoard = function(result) {
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        this.syncSquare(result[i][j], this.pos[i][j]);
      }
    }
  };

  this.syncSquare = function(from, to) {
    to.piece = from.piece;
    to.color = from.color;

    if (to.firstChild)
      to.removeChild(to.firstChild);
    if (to.piece) {
      to.appendChild(this.getImg(to.piece, to.color));
    }
  };
}

/*
 * Provides support for different chess & button sets. Takes three optional
 * arguments. The first argument specifies the SET identifier (defaults to
 * 'default'), the second is the image prefix (defaults to ""), and the third is
 * the image suffix (defaults to 'gif').
 */
function BoardImages(options) {
  this.set = "default";
  this.pref = "";
  this.suf = 'gif';
  if (options['set']) {
    this.set = options['set'];
  }
  if (options['imagePrefix']) {
    this.pref = options['imagePrefix'];
  }
  if (options['imageSuffix']) {
    this.suf = options['imageSuffix'];
  }
  this.imageNames = {
    "default" : {
      "white" : {
        "rook" : "wRook." + this.suf,
        "bishop" : "wBishop." + this.suf,
        "knight" : "wKnight." + this.suf,
        "queen" : "wQueen." + this.suf,
        "king" : "wKing." + this.suf,
        "pawn" : "wPawn." + this.suf
      }

      ,
      "black" : {
        "rook" : "bRook." + this.suf,
        "bishop" : "bBishop." + this.suf,
        "knight" : "bKnight." + this.suf,
        "queen" : "bQueen." + this.suf,
        "king" : "bKing." + this.suf,
        "pawn" : "bPawn." + this.suf
      }

      ,
      "btns" : {
        "ffward" : "buttons/ffward." + this.suf,
        "rwind" : "buttons/rwind." + this.suf,
        "forward" : "buttons/forward." + this.suf,
        "back" : "buttons/back." + this.suf,
        "toggle" : "buttons/toggle." + this.suf,
        "comments" : "buttons/comments." + this.suf,
        "flip" : "buttons/flip." + this.suf
      }
    }
  };

  this.preload = function() {
    var set = this.set;
    var pref = this.pref;
    if (arguments.length > 0)
      set = arguments[0];
    if (arguments.length > 1)
      pref = arguments[1];
    var img;
    for ( var i in this.imageNames[set]) {
      for ( var j in this.imageNames[set][i]) {
        img = new Image();
        img.src = this.imageNames[set][i][j];
      }
    }
  };
};

function isYahoo(pgn) {
  pgn = pgn.replace(/^\s+|\s+$/g, '');
  return pgn.charAt(0) == ';';
}

function detectRoot() {
  var scripts = document.getElementsByTagName('script');

  for (var i = 0; i < scripts.length; i++) {
    // good for testing when the JS is not in a single file
    var idx = scripts[i].src.indexOf("board.js");
    if (idx != -1) {
      return scripts[i].src.substring(0, idx);
    }
    
    // for production, where everthing is in a single file
    var idx = scripts[i].src.indexOf("jsPgnViewer.js");
    if (idx != -1) {
      return scripts[i].src.substring(0, idx);
    }
  }
}

function resetStyles(obj) {
  obj.style.background = 'transparent';
  obj.style.margin = 0;
  obj.style.padding = 0;
  obj.style.border = 0;
  obj.style.fontSize = "100%";
  obj.style.outline = 0;
  obj.style.verticalAlign = "middle";
  obj.style.textAlign = "center";
  obj.style.borderCollapse = "separate";
  obj.style.lineHeight = "normal";
  return obj;
}
