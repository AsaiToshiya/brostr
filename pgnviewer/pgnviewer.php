<?php
/*
Plugin Name: Pgn Viewer
Plugin URI: http://pgnview.edicypages.com/
Description: Allows to add PGN files to your blog posts that are converted to interactive boards. Easy to share your chess games with your friends.
Version: 0.7.3
Author: Toomas Römer
Author URI: http://toomasr.com/
*/

/*  Copyright 2010  Toomas Römer  (email : toomasr[at]gmail)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

function tr_pgnview_callback($str) {
	$siteurl = get_option("siteurl");
	// wow, i had a millisecond collision :)
	// this should sort it out
	$now = time()+mt_rand();
	// tinyMCE might have added <br /> and other tags
	$str = strip_tags($str);
	// strip entities
	$str = str_replace(array('&#8220;', '&#8221;', '&#8243;'), '"', $str);
	// strip the ###pgn### and %%%pgn%%% placeholders
	$str = str_replace(array('###pgn###', '%%%pgn%%%'), '', $str);
	// tinyMCE or WP thinks that replacing ... with an entity behind the scenes
	// will not break anything and serves a purpose! DEAD WRONG!
	$str = str_replace(array('&#8230;'), '...', $str);
	// hidden div with the game information
	$rtrn = '<div id="'.$now.'" style="visibility:hidden;display:none">'.$str."</div>\n";
	// the div that will contain the graphical board
	$rtrn .= '<div id="'.$now.'_board"></div>';
	

	$opts = array();
	// jspgnviewer options
	$opts['showMovesPane'] = true;
	$opts['moveFontColor'] = '#af0000';
	$opts['squareSize'] = '32px';
	$opts['markLastMove'] = false;
	$opts['squareBorder'] = '0px solid #000000';
	$opts['moveBorder'] = '1px solid #cccccc';
	// end of jspgnviewer options

	// initialize the board
	$optsStr = "";
	foreach ($opts as $key=>$value) {
		if (is_bool($value) || strtolower($value)==="true" || 
				strtolower($value) === "false") {
			$value = $value?"true":"false";
			$optsStr .= "'$key':$value,\n";
		}
		else {
			$optsStr .= "'$key':'$value',\n";
		}
	}
	$optsStr[strlen($optsStr)-2]="\n";
	$rtrn .= '<script>var brd = new Board('.$now.',{'.$optsStr.'});brd.init()</script>';
	$rtrn .= '<noscript>You have JavaScript disabled and you are not seeing a graphical interactive chessboard!</noscript>';

	return $rtrn;
}

function tr_add_script_tags($_) {
	$siteurl = get_option("siteurl");
	echo "<script src='${siteurl}/wp-content/plugins/pgnviewer/jsPgnViewer.js'></script>\n";
}

function tr_pgnview($content) {
  $tmpStr = $content;

  // backwards compatibility
  $tmpStr = str_replace("###pgn###", "<pgn>", $tmpStr);
  $tmpStr = str_replace("%%%pgn%%%", "</pgn>", $tmpStr);

  while (strpos($tmpStr, '<pgn>') !== FALSE && strpos($tmpStr, '</pgn>')) {
    $startPos = strpos($tmpStr, '<pgn>');
    $len = strpos($tmpStr, '</pgn>')+6-$startPos;

    $game = substr($tmpStr, $startPos, $len);
    $gamePGN = tr_pgnview_callback($game);

    $tmpStr = substr_replace($tmpStr, $gamePGN, $startPos, $len);
  }

  return $tmpStr;
}

add_filter('the_content', 'tr_pgnview');
add_action('wp_head', 'tr_add_script_tags');
?>
