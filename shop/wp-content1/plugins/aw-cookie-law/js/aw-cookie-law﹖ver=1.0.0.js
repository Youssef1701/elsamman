(function ( $ ) {

    'use strict';

    if ( 'set' !== $.cookie( 'aw-cookie-law' ) ) {

        $( 'body' ).prepend(
            '<div class="aw-cookie-law">'+
			aw_cookie_law_text.message+
			' <a href="http://www.cnil.fr/vos-droits/vos-traces/les-cookies/conseils-aux-internautes" target="_blank">'+aw_cookie_law_text.more+'</a>'+
            '<button class="accept-cookie">'+aw_cookie_law_text.button+'</button></div>'
        );

        $( '.aw-cookie-law .accept-cookie' ).click(function () {

            $.cookie( 'aw-cookie-law', 'set', { expires: 7 } );
            $( '.aw-cookie-law' ).remove();

        });

    }

}( jQuery ) );