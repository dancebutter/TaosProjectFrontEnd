/*

https://github.com/dpiccone/ng-pageslide

http://ngmodules.org/modules/ng-pageslide

geArgus:

 8/12/2014
	GST enhanced/fixed
	1. bug in code that would not allow an image to appear in the pageslide attribute.
		fixed it by adding feature attr: ps-enable-ge-argus-behavior
	2. His code was flawed in that it adjusted the open/close state falsely every time the $digest was called
	   rather than only when it was actually changed. GST fixed with new algorithm
*/


var pageslideDirective = angular.module ( "pageslide-directive", [] );

var boolGlobalAngularPageSlideModifiedbyGe = true;	// flag for app to make sure that this version is loaded and not a newer non-ge version from the web


pageslideDirective.directive ( 'pageslide',
	[ '$interval',
    function ( $interval ) {
        var defaults = {};

        /* Return directive definition object */

        return {
            restrict: "EA",
            replace: false,
            transclude: false,
            scope: true,
            link: function ( $scope, el, attrs ) {
                /* Inspect */
                //console.log ( $scope );
                //console.log ( el );
                //console.log ( attrs );

                /* parameters */
                var param = {};

				var strGeAttr = 'gePageSlideSlideWasSetToInitialState';

				// geArgus: GST added this attr
				param.enableGeArgusBehavior = attrs.psEnableGeArgusBehavior || false;

				param.side = attrs.pageslide || 'right';
                param.speed = attrs.psSpeed || '0.5';
                param.size = attrs.psSize || '300px';
                param.className = attrs.psClass || 'ng-pageslide';

                /* DOM manipulation */
                //console.log ( el );
                var content = null;

				// geArgus: GST found bug here.

				var boolNoChildren = true;

				if (  param.enableGeArgusBehavior ) {
					// ge behavior

					boolNoChildren = false;

				} else {

					boolNoChildren = el.children () && el.children ().length;
				};

				if (  boolNoChildren ) {
					// have children.
					// use them in lieu of target

                    content = el.children () [0];

                } else {
					// no children
					// insert our target's contents instead

                    content = ( attrs.href ) ? document.getElementById ( attrs.href.substr ( 1 ) ) : document.getElementById ( attrs.psTarget.substr ( 1 ) );
                }

                //console.log ( content );
                // Check for content
                if ( !content ) 
                    throw new Error ( 'You have to elements inside the <pageslide> or you have not specified a target href' );
                var slider = document.createElement ( 'div' );
                slider.className = param.className;

                /* Style setup */
                slider.style.transitionDuration = param.speed + 's';
                slider.style.webkitTransitionDuration = param.speed + 's';
                slider.style.zIndex = 1000;
                slider.style.position = 'fixed';
                slider.style.width = 0;
                slider.style.height = 0;
                slider.style.transitionProperty = 'width, height';

                switch ( param.side ) {
                    case 'right':
                        slider.style.height = attrs.psCustomHeight || '100%'; 
                        slider.style.top = attrs.psCustomTop ||  '0px';
                        slider.style.bottom = attrs.psCustomBottom ||  '0px';
                        slider.style.right = attrs.psCustomRight ||  '0px';
                        break;
                    case 'left':
                        slider.style.height = attrs.psCustomHeight || '100%';   
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        break;
                    case 'top':
                        slider.style.width = attrs.psCustomWidth || '100%';   
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.top = attrs.psCustomTop || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                    case 'bottom':
                        slider.style.width = attrs.psCustomWidth || '100%'; 
                        slider.style.bottom = attrs.psCustomBottom || '0px';
                        slider.style.left = attrs.psCustomLeft || '0px';
                        slider.style.right = attrs.psCustomRight || '0px';
                        break;
                }


                /* Append */
                document.body.appendChild ( slider );
                slider.appendChild ( content );

                /* Closed */
                function psClose ( slider,param ) {
                    if ( slider.style.width !== 0 && slider.style.width !== 0 ) {
                        content.style.display = 'none';
                        switch ( param.side ) {
                            case 'right':
                                slider.style.width = '0px'; 
                                break;
                            case 'left':
                                slider.style.width = '0px';
                                break;
                            case 'top':
                                slider.style.height = '0px'; 
                                break;
                            case 'bottom':
                                slider.style.height = '0px'; 
                                break;
                        }
                    }
                }

                /* Open */
                function psOpen ( slider,param ) {
                    if ( slider.style.width !== 0 && slider.style.width !== 0 ) {
                        switch ( param.side ) {
                            case 'right':
                                slider.style.width = param.size; 
                                break;
                            case 'left':
                                slider.style.width = param.size; 
                                break;
                            case 'top':
                                slider.style.height = param.size; 
                                break;
                            case 'bottom':
                                slider.style.height = param.size; 
                                break;
                        }
                        setTimeout ( function () {
                            content.style.display = 'block';
                        }, ( param.speed * 1000 ) );

                    }
                }

				// geArgus: gt added logic for initialization

				if ( $( el ).attr ( strGeAttr ) == undefined ) {
					// not present
					// set it

					$( el ).attr ( strGeAttr, true );

					var boolPsOpen = eval ( '$scope.' + attrs.psOpen );
					boolPsOpen = !!boolPsOpen;	// convert to bool

					if ( boolPsOpen ) {
						// open

						psOpen ( slider, param );

					} else {
						// closed

						psClose ( slider, param )
					}
				} else {
					// present
					;
				}

                /*
                * Watchers
                * */

                $scope.$watch (
					attrs.psOpen,
					function ( newValue, oldValue ) {

						// console.log ( newValue + ' : ' + oldValue );

						if ( newValue !== oldValue ) {
							// Only increment the counter if the value changed
							// changed

							if ( !!newValue ) {
								// Open

								// console.log ( 'open' );

								psOpen ( slider, param );

							} else {
								// Close

								// console.log ( 'close' );

								psClose ( slider, param );
							}
						} else {
							// no change
							;
						}
                	}
				);

                // close panel on location change
                if ( attrs.psAutoClose ) {
                    $scope.$on ( "$locationChangeStart", function () {
                        psClose ( slider, param );
                    } );
                    $scope.$on ( "$stateChangeStart", function () {
                        psClose ( slider, param );
                    } );
                }

               

                /*
                * Events
                * */
                var close_handler = ( attrs.href ) ? document.getElementById ( attrs.href.substr ( 1 ) + '-close' ) : null;
                if ( el[0].addEventListener ) {
                    el[0].addEventListener ( 'click',function ( e ) {
                        e.preventDefault ();
                        psOpen ( slider,param );                    
                    } );

                    if ( close_handler ) {
                        close_handler.addEventListener ( 'click', function ( e ) {
                            e.preventDefault ();
                            psClose ( slider,param );
                        } );
                    }
                } else {
                    // IE8 Fallback code
                    el[0].attachEvent ( 'onclick',function ( e ) {
                        e.returnValue = false;
                        psOpen ( slider,param );                    
                    } );

                    if ( close_handler ) {
                        close_handler.attachEvent ( 'onclick', function ( e ) {
                            e.returnValue = false;
                            psClose ( slider,param );
                        } );
                    }
                }

            }
        };
    }
] );
