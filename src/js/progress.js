
//see example in http://thoughts.z-dev.org/2014/07/02/creating-a-page-progress-jquery-plugin/

!(function($) {
    $.fn.scrollProgress = function() {

        // progress element
        var prElement = document.createElement('progress');

        var windDiv = document.getElementById('lowerContentTextWindow');
        windDiv.appendChild(prElement);

        // element state info
        var docOffset = $(this).offset().top,
            elmHeight = $(this).height(),
            winHeight = $(window).height();

        // initial value of progress element
        $(prElement).attr('min', 0);
        $(prElement).attr('max', 1);
        $(prElement).attr('value', 0);

        // listen for scroll changes
        $('#lowerContentTextWindow').on('scroll', function() {

            // docScroll     = relative window position to top of page
            // windowOffset  = relative position of element to top of window
            // viewedPortion = how much of the element has been seen / is visible
            var docScroll = $('#lowerContentTextWindow').scrollTop(),
                windowOffset = docOffset - docScroll,
                viewedPortion =  docScroll;

            // do max / min for proper percentages
            if(viewedPortion < 0) viewedPortion = 0;
            if(viewedPortion > elmHeight) viewedPortion = elmHeight;

            // calculate viewed percentage
            var viewedPercentage = viewedPortion / elmHeight;

            // set percent in progress element
            $(prElement).attr('value', viewedPercentage);

        });

        // track window changes to make sure that values are consistent
        var self = this;
        $('#lowerContentTextWindow').on('resize', function() {

            // update tracking values
            docOffset = $(self).offset().top;
            elmHeight = $(self).height();
            winHeight = $('#lowerContentTextWindow').height();

            // trigger a scroll event to fix any potential issues
            $('#lowerContentTextWindow').trigger('scroll');

        });

        // trigger scroll to render
        $(window).trigger('scroll');

    };
})(jQuery);
