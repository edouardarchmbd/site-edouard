(function($) {
    "use strict";

    /* Section headings */
    // This appends 4 elements to section headings for easy styling
    $('.section-heading:not(.js-no-borders), .hero-heading:not(.js-no-borders)').each(function() {
        $(this).append('<div class="tl"/>').append('<div class="tr"/>').append('<div class="br"/>').append('<div class="bl"/>');
    });

    /* Fixed navigation */
    // This detects if the navigation should be fixed while scrolling
    $(window).bind('scroll', function() {
        var $this   = $(this);
        var $body   = $('body');
        var offset  = 0 === $('#hero').length ? 0 : $('#hero').height() + $('#hero').offset().top;
        if($this.scrollTop() >= offset) {
            $body.addClass('nav-fixed');
        } else {
            $body.removeClass('nav-fixed');
        }
    });

    /* Autocollapse navigation */
    // Automatically collpase the navigation bar when clicking a link in mobile device design mode
    $('.navbar-collapse a').bind('click', function(e) {
        $('.navbar-collapse').collapse('hide');
    });

    /* Center nested navigation */
    // This centers the first nested navigation list to it's parent
    var nestedNavigationCenter  = function() {
        if(768 <= $(window).width()) {
            $('.nav > li > ul').each(function() {
                var $this   = $(this);
                $this.css({marginLeft: $this.width() / -2});
            });
        } else {
            $('.nav > li > ul').css({marginLeft: 15});
        }
    };
    $(window).bind('resize-end', nestedNavigationCenter);
    nestedNavigationCenter();

    /* Navigation scroll spy */
    // Automatically highlight a navigation link when user scrolls to the target section
    var navigationScrollSpy = function() {
        var $body   = $('body');
        if(!$body.data('scrollSpyActivated')) {
            $body.data('scrollSpyActivated', true);
            $body.scrollspy({target: '.navbar-collapse', offset: $('.navbar').outerHeight(true) + 1});
        } else {
            $body.scrollspy('refresh');
        }
    };
    $(window).bind('resize', navigationScrollSpy);
    navigationScrollSpy();

    /* Native placeholder support */
    // Mimic form fields placeholders for browsers which do not support it (yes IE9, I'm looking at you!)
    if(!('placeholder' in document.createElement('input'))) {
        $('[placeholder]').each(function() {
            var $this   = $(this);
            if(0 === $this.val().length) {
                $this.val($this.attr('placeholder'));
            }
        }).bind('focus', function() {
            var $this   = $(this);
            if($this.val() == $this.attr('placeholder')) {
                $this.val('');
            }
        }).bind('blur', function() {
            var $this   = $(this);
            if($this.val() == '') {
                $this.val($this.attr('placeholder'));
            }
        });
    }

    /* Void buttons */
    // Do nothing when clicking on buttons with href="#"
    $('[href="#"]').bind('click', function(e) {
        e.preventDefault();
    });

    /* Popup window */
    // Open pages in popup when clicking on links which href starts with #!
    function bindPopups() {
        $('[href^="#!"]').unbind('click').bind('click', function(e) {
            e.preventDefault();
            var $this   = $(this);
            var $body   = $('body');
            var $popup  = $('#popup');
            var url     = $this.attr('href').substring(2);
            history.replaceState(null, null, '#!' + url);
            $body.addClass('popup-open');
            $popup.attr('src', url);
            $popup.show();
        });
    }
    bindPopups();

    // Automatically open popup if page URL requests it
    if(document.location.hash.match(/^\#\!.+/)) {
        var $link = $('<a href="' + document.location.hash + '"/>');
        $('body').append($link);
        bindPopups();
        $link.triggerHandler('click');
        $link.remove();

    }

    /* Close popup */
    // Close the popup
    $('.nav-close').bind('click', function(e) {
        e.preventDefault();
        var $parent = $(document).parent();
        var $body   = $(window.parent.document.body);
        var $popup  = $('#popup', window.parent.document.body);
        $popup.hide().attr('src', 'about:blank');
        $body.removeClass('popup-open');
        window.parent.history.replaceState(null, null, window.parent.document.location.pathname);
    });

    /* Skill bars */
    // Animate the skill bars, 3000 is the animation duration, make sure it matches the one from the CSS (or LESS)
    $('.skill-bar').each(function() {
        var $this   = $(this);
        var value   = parseInt($this.attr('data-value'));
        $this.data('animate-skill', function() {
            if($this.hasClass('skill-bar-bullets')) {
                var $bullets        = $this.find('.fill');
                var thresholdStep   = 100 / $bullets.length;
                $bullets.each(function(index) {
                    var $this       = $(this);
                    var threshold   = (index + 1) * thresholdStep;
                    setTimeout(function() {
                        if(threshold <= value) {
                            $this.css('opacity', 1);
                        } else if(threshold - thresholdStep < value) {
                            $this.css('opacity', (threshold - value) / thresholdStep);
                        }
                    }, index * (3000 / $bullets.length));
                });
            } else {
                $this.animate({dummy: 1}, {
                    duration: 3000,
                    easing:   $.bez([0.13, 0.71, 0.30, 0.94]),
                    step:     function(now) {
                        $(this).find('.value').html(Math.round(value * now) + '%');
                    }
                });
                $this.find('.fill').css({width: value + '%'});
            }
        });
        if($this.hasClass('skill-bar-bullets')) {
            var $bullets = $this.find('.fill');
            $bullets.css('width', ((101 / $bullets.length) - 1) + '%');
        }
        if($.fn.initScrollCallback) {
            $this.attr('data-animate-callback', 'animate-skill');
        } else {
            $this.data('animate-skill').call();
        }
    });

    /* Portfolio isotope */
    $('.portfolio[data-portfolio-url]').bind('loadItems', function() {
        var $this   = $(this);
        var $items  = $this.children('.item');
        var templ   = $this.attr('data-portfolio-template');
        var offset  = $items.length;
        $.post($this.attr('data-portfolio-url'), {items: $items.length}, function(data) {
            $.each(data, function(i, item) {
                var tpl     = templ;
                $.each(item, function(name, value) {
                    tpl = tpl.replace(new RegExp("{{" + name + "}}", "g"), value);
                });
                var $item   = $(tpl);
                var $images = $item.find('img');
                $item.attr('data-sort', i + offset).data('images', $images.length).bind('image-ready', function() {
                    $item.data('images', $item.data('images') - 1);
                    if(0 >= $item.data('images')) {
                        $this.isotope('insert', $item);
                        bindPopups();
                    }
                });
                $images.each(function() {
                    var image   = new Image();
                    $(image).bind('load', function() {
                        $item.triggerHandler('image-ready');
                    });
                    image.src   = $(this).attr('src');
                });
                if(0 === $images.length) {
                    $item.triggerHandler('image-ready');
                }
            });
        }, 'json');
    }).each(function() {
        var $this = $(this);
        $this.isotope({
            itemSelector: '.item',
            layoutMode: 'masonry',
            transitionDuration: '1s',
            sortBy: 'sort',
            getSortData: {
                'sort': function() {
                    return parseInt($(this).attr('data-sort'));
                }
            },
            masonry: {
                resizable: false,
                columnWidth: $this.width() < 313 ? 270 : 313,
                gutter: 0
            }
        }).isotope('on', 'layoutComplete', function() {
            navigationScrollSpy();
        });
        if(true !== $this.data('first-load')) {
            $this.data('first-load', true);
            $this.triggerHandler('loadItems');
            setInterval(function() {
                $this.isotope({masonry: {columnWidth: $this.width() < 313 ? 270 : 313}}).isotope('layout');
            }, 1000);
        }
    });
    $('[data-portfolio-loadmore]').bind('click', function(e) {
        e.preventDefault();
        var $target = $($(this).attr('data-portfolio-loadmore')).filter('.portfolio[data-portfolio-url]');
        if(0 < $target.length) {
            $target.triggerHandler('loadItems');
        }
    });

    /* Portfolio filtering */
    // Isotope portfolio filtering
    $('.portfolio-filter a').bind('click', function(e) {
        e.preventDefault();
        var $this   = $(this);
        var $target = $($this.attr('data-target'));
        if(0 < $target.length) {
            $this.parent('li').parent('ul').find('li.active').removeClass('active');
            $this.parent('li').addClass('active');
            $target.isotope({filter: $this.attr('data-filter')});
        }
    });

    /* Smooth section scrolling */
    // Autoscroll to target element when clicking on a link which href looks like this: #SOMEID and there is element with id="SOMEID" on the page
    $('[href^="#"]:not([href^="#!"]):not([href="#"])').bind('click', function(e) {
        e.preventDefault();
        var $this   = $(this);
        var $target = $($this.attr('href'));
        var speed   = isNaN(parseInt($('body').attr('data-scroll-speed'))) ? 1000 : parseInt($('body').attr('data-scroll-speed'));
        if(0 < $target.length) {
            $.scrollTo.window().queue([]).stop();
            $.scrollTo({left: 0, top: Math.max(0, $target.offset().top - (0 === $('.navbar-header').height() ? $('.navbar-nav').height() : $('.navbar-header').height()) - 100)}, {duration: speed, easing: $.bez([1, 0.01, 0, 1])});
        }
    });

    /* Expandable sections */
    $('.expandable').each(function() {
        var $this   = $(this);
        $this.find('.diamond').bind('click', function(e) {
            e.preventDefault();
            $this.toggleClass('open');
            if($this.hasClass('open')) {
                $this.find('.expandable-content').stop().slideDown({duration: 1000, easing: $.bez([1, 0.01, 0, 1])});
                $this.triggerHandler('expandable-open');
            } else {
                $this.find('.expandable-content').stop().slideUp({duration: 1000, easing: $.bez([1, 0.01, 0, 1])});
                $this.triggerHandler('expandable-close');
            }
        });
    });

    /* Rollers */
    function childHeight($element) {
        var height  = 0;
        var min     = 0;
        $element.children().each(function() {
            var $this   = $(this);
            if('none' != $this.css('float')) {
                min     = Math.max(min, $this.outerHeight() + parseInt($this.css('margin-top')) + parseInt($this.css('margin-bottom')));
            }
            if('absolute' != $this.css('position') && 'none' == $this.css('float')) {
                height  += $this.outerHeight() + parseInt($this.css('margin-top')) + parseInt($this.css('margin-bottom'));
            }
        });
        return Math.max(height, min) - 1;
    }
    $('.roller').each(function() {
        var $roller = $(this);
        var $list   = $roller.find('.roller-list');
        var $items  = $list.first().children();
        var $prev   = $roller.find('.roller-prev');
        var $next   = $roller.find('.roller-next');
        var $blts   = $roller.find('.roller-bullets');
        var $parent = $roller.parents('.expandable');
        $list.bind('page', function() {
            var $this = $(this);
            $this.height(childHeight($this.children().eq($this.data('roller-page'))));
            $this.children().first().css('margin-top', 0);
            $this.children().first().css('margin-top', $this.children().first().offset().top - $this.children().eq($this.data('roller-page')).offset().top + parseInt($this.children().first().children().first().css('margin-top')));
        });
        $next.bind('click', function(e) {
            e.preventDefault();
            $list.data('roller-page', $list.data('roller-page') + 1 < $items.length ? $list.data('roller-page') + 1 : 0);
            $list.each(function() {
                $(this).triggerHandler('page');
            });
        });
        $prev.bind('click', function(e) {
            e.preventDefault();
            $list.data('roller-page', $list.data('roller-page') - 1 >= 0 ? $list.data('roller-page') - 1 : $items.length - 1);
            $list.each(function() {
                $(this).triggerHandler('page');
            });
        });
        $parent.bind('expandable-open', function() {
            $next.triggerHandler('click');
            $prev.triggerHandler('click');
        });
        if(0 < $blts.length) {
            for(var i = 0; i < $items.length; i++) {
                var $bullet = $('<a href="#" class="roller-bullet"/>');
                if(0 === i) {
                    $bullet.addClass('active');
                }
                $blts.append($bullet.data('roller-page', i).bind('click', function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    $blts.children().removeClass('active').eq($this.data('roller-page')).addClass('active');
                    $list.data('roller-page', $this.data('roller-page'));
                    $list.each(function() {
                        $(this).triggerHandler('page');
                    });
                }));
            }
        }
        $list.data('roller-page', 0);
        $list.each(function() {
            $(this).triggerHandler('page');
        });
    });
})(jQuery);