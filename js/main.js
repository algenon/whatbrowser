(function($, ZeroClipboard, Hashcode, WhatBrowser, WhatBrowserManager) {
    'use strict';

    function render_property(name, value) {
        var str_value = value.toString ? value.toString() : '' + value;
        if (!str_value) {
            return '';
        }
        return '<tr>' +
            '<th>' + name + '</th>' +
            '<td>' + str_value + '</td>' +
            '</tr>';
    }

    function render_info(whatbrowser) {
        var properties = '';
        properties += render_property('Куки', whatbrowser.cookies ? 'да' : 'нет');
        properties += render_property('Флеш', whatbrowser.flash);
        properties += render_property('Java', whatbrowser.java);
        properties += render_property('Язык', whatbrowser.language);
        properties += render_property('Страница', whatbrowser.browser_size);
        properties += render_property('Экран', whatbrowser.screen);
        properties += render_property('Браузер', whatbrowser.ua.browser);
        properties += render_property('Движок', whatbrowser.ua.engine);
        properties += render_property('ОС', whatbrowser.ua.os);
        properties += render_property('Устройство', whatbrowser.ua.device);
        properties += render_property('Юзер-агент', whatbrowser.ua);
        return properties;
    }

    function render_header(whatbrowser, own) {
        var header_msg = '';
        if (!own) {
            header_msg = 'Вы смотрите браузер по ссылке ' +
                '<a href="' + whatbrowser.link + '">' + whatbrowser.id + '</a>';
        }
        else if (whatbrowser.ua.browser.name) {
            header_msg = 'У вас ' + whatbrowser.ua.browser.name + ' ' + whatbrowser.ua.browser.major;
            header_msg += whatbrowser.ua.os.name ? ' на ' + whatbrowser.ua.os.name : '';
        } else {
            header_msg = 'У вас неизвестный науке браузер :-(';
        }
        return header_msg;
    }

    function show_geo(whatbrowser) {
        var $details = $('#details-table').children('tbody'),
            properties = $details.html();
            properties += render_property('IP-адрес', whatbrowser.geo.ip || '');
            properties += render_property('Местоположение', whatbrowser.geo.address);
            $details.html(properties);
            $('#details-tocopy').val(Hashcode.serialize(whatbrowser));
    }

    function show_links(whatbrowser) {
        if (whatbrowser.id && whatbrowser.flash.enabled) {
            // can copy link to clipboard
            $('#copy-value').val(whatbrowser.link);
        } else if (whatbrowser.id) {
            // can only send link via mail
            $('#info-link-copy').hide();
            $('#mail-value').val(whatbrowser.link);
            $('#info-link-mail').find('a').attr('href', 'mailto:?subject=Информация о моем браузере&body=http://whatbrowser.ru/#!' + whatbrowser.id)
            $('#info-link-mail').show();
        } else {
            // browser info is not persisted, no link available
            $('#info-link').hide();
            $('#info-nolink').show();
        }
    }

    function show_info(whatbrowser, own) {
        var $details = $('#details-table').children('tbody');
        $details.html(render_info(whatbrowser));
        $('#details-tocopy').val(Hashcode.serialize(whatbrowser));
        $('#header-msg').html(render_header(whatbrowser, own));
        if (own) {
            show_links(whatbrowser);
        } else {
            $('#info-link').hide();
        }
        $('#message').hide();
        $('#result').fadeIn();
    }

    function init_clipboard($button) {
        var clipboard = new ZeroClipboard($button.get(0));
        clipboard.on('aftercopy', function(e) {
            var $status = $(e.target).next();
            $status.text('Скопировано!');
            window.setTimeout(function() {
                $status.text('');
            }, 500);
        });
    }

    function init_ui() {
        $('.link-text').click(function() {
            $(this).select();
        });
        ZeroClipboard.config({
            hoverClass: 'zero-hover',
            activeClass: 'zero-active'
        });
        init_clipboard($('#info-link').find('button'));
    }

    function show_by_id(id) {
        WhatBrowserManager.load(id.value)
            .done(function(whatbrowser) {
                show_info(whatbrowser, id.own);
            })
            .fail(function(error) {
                console.log('Failed to load by id ' + id.value + ': ' + error.message);
                if (id.own) {
                    show();
                } else {
                    $('#message').find('h2').text('По этой ссылке ничего нет :-(');
                }
            });
    }

    function show() {
        WhatBrowserManager.create()
            .done(function(whatbrowser) {
                show_info(whatbrowser, true);
            })
            .fail(function(whatbrowser, error) {
                console.log('Failed to save browser info: ' + error.message);
                show_info(whatbrowser, true);  
            });
    }

    $(function() {
        init_ui();
        WhatBrowser.on_geo = show_geo;
        var id = WhatBrowserManager.get_id();
        if (id) {
            show_by_id(id);
        } else {
            show();
        }
    });
    
})(
    window.jQuery, 
    window.ZeroClipboard, 
    window.Hashcode, 
    window.WhatBrowser,
    window.WhatBrowserManager
);
