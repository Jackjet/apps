/**
 * @summary     ConditionalPaging
 * @description Hide paging controls when the amount of pages is <= 1
 * @version     1.0.0
 * @file        dataTables.conditionalPaging.js
 * @author      Matthew Hasbach (https://github.com/mjhasbach)
 * @contact     hasbach.git@gmail.com
 * @copyright   Copyright 2015 Matthew Hasbach
 *
 * License      MIT - http://datatables.net/license/mit
 *
 * This feature plugin for DataTables hides paging controls when the amount
 * of pages is <= 1. The controls can either appear / disappear or fade in / out
 *
 * @example
 *    $('#myTable').DataTable({
 *        conditionalPaging: true
 *    });
 *
 * @example
 *    $('#myTable').DataTable({
 *        conditionalPaging: {
 *            style: 'fade',
 *            speed: 500 // optional
 *        }
 *    });
 */

(function(window, document, $) {
    $(document).on('init.dt', function(e, dtSettings) {
        if ( e.namespace !== 'dt' ) {
            return;
        }

        var options = dtSettings.oInit.conditionalPaging;

        if (true || $.isPlainObject(options) || options === true) {
            var config = $.isPlainObject(options) ? options : {},
                api = new $.fn.dataTable.Api(dtSettings),
                speed = 'slow',
                conditionalPaging = function(e) {
                    // 增加div.dataTables_length，让一页显示多少条记录选项框与翻页按钮一同显示或隐藏
                    var $paging = $(api.table().container()).find('div.dataTables_paginate'),
                        $lengthing = $(api.table().container()).find('div.dataTables_length'),
                        pages = api.page.info().pages,
                        recordsTotal = api.page.info().recordsTotal;

                    if (e instanceof $.Event) {
                        if (pages <= 1) {
                            if (config.style === 'fade') {
                                $paging.stop().fadeTo(speed, 0);
                            }
                            else {
                                $paging.css('visibility', 'hidden');
                            }
                        }
                        else {
                            if (config.style === 'fade') {
                                $paging.stop().fadeTo(speed, 1);
                            }
                            else {
                                $paging.css('visibility', '');
                            }
                        }
                        // if (recordsTotal <= 10) {
                        //     if (config.style === 'fade') {
                        //         $lengthing.stop().fadeTo(speed, 0);
                        //     }
                        //     else {
                        //         $lengthing.css('visibility', 'hidden');
                        //     }
                        // }
                        // else {
                        //     if (config.style === 'fade') {
                        //         $lengthing.stop().fadeTo(speed, 1);
                        //     }
                        //     else {
                        //         $lengthing.css('visibility', '');
                        //     }
                        // }
                    }
                    else if (pages <= 1) {
                        if (config.style === 'fade') {
                            $paging.css('opacity', 0);
                        }
                        else {
                            $paging.css('visibility', 'hidden');
                        }
                        // if (recordsTotal <= 10) {
                        //     if (config.style === 'fade') {
                        //         $lengthing.css('opacity', 0);
                        //     }
                        //     else {
                        //         $lengthing.css('visibility', 'hidden');
                        //     }
                        // }
                    }
                };

            if ($.isNumeric(config.speed) || $.type(config.speed) === 'string') {
                speed = config.speed;
            }

            conditionalPaging();

            api.on('draw.dt', conditionalPaging);
        }
    });
})(window, document, jQuery);