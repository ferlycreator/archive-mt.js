!function ($) {

      $(function(){
            var $window = $(window);

            setTimeout(function () {
            $('.bs-docs-sidenav').affix({
            offset: {
                  top: function () { return $window.width() <= 980 ? 290 : 210 }
                        , bottom: 270
                        }
                  })
            }, 100);
            window.prettyPrint && prettyPrint();
            $('.nav-item a').on('click', function () {
                  $('.nav-item').removeClass('active');
                  $(this.parentNode).addClass('active');
            });

      })
}(window.jQuery)
