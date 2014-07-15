/*
 *
 */

;(function ($) {

    var pluginName = "PageTable";
    var oldpluginName = $.fn[pluginName];

    var PageTable = function(element, options) {
        this._self = null;
        this._init(element, options);
    };

    PageTable.prototype = {
        // table 
        _table: null,
        _pagenav: null,

        // data source
        _pageSource: null,

        _currentPage: null,
        _totalPages: null,
        _startPage: null,
        _endPage: null,
        _startRow: null,
        _endRow: null,
        _sortedColumn: null,
        _sortedOrder: null,
        _sortedEvent: null,
        $element: null,
        _options: null,


        _init: function(element, options) {
            _self = this;
            _self.$element = $(element);
            _self._options = $.extend({}, _self._defaults, options);
            _self._currentPage = _self._options.pageNumber;
            _self._sortedColumn = _self._options.sortedColumn;
            _self._sortedOrder = _self._options.sortedOrder;

            // empty and show loading 
            if (!_self._options.dataSource) {
                _self.$element.empty();
                _self._showLoading();
            }
            else {
                _self._refreshData(null);
            }
        },

        _refreshData: function(data) {
            if (data && typeof data == 'object') {
                _self._options.dataSource = data.dataSource;
            }
            if (data && typeof data == 'string') {
                if (data == 'head.click')
                    _self._sortedEvent = true;
                else
                    _self._sortedEvent = false;
            }
            if (_self._options.dataSource.length == 0) {
                _self._showLoading();
                return;
            }

            if (!_self._sortedEvent) 
                _self._computePageData();
            _self._sortPageData();
            _self._buildTable();
            _self._buildPagenav();
            if (_self._sortedEvent) 
                _self._fixSortedHeader();

            var html = $('<div class="pt-border"></div>');
            html.append(_self._table);
            html.append(_self._pagenav);

            _self.$element.empty();
            _self.$element.append(html);
        },

        _computePageData: function() {
            _self._totalPages = Math.ceil(_self._options.dataSource.length / _self._options.pageSize);
            _self._startPage = Math.floor(_self._currentPage / 5) * 5 + 1;
            _self._endPage = Math.min(Math.floor(_self._currentPage / 5) * 5 + 5, _self._totalPages);
            _self._startRow = _self._options.pageSize * (_self._currentPage - 1) + 1;
            _self._endRow = Math.min(_self._startRow -1 + _self._options.pageSize, _self._options.dataSource.length);
        },

        _sortPageData: function() {
            _self._pageSource = [];
            for (var i = _self._startRow - 1; i < _self._endRow; i++) {
                _self._pageSource.push(_self._options.dataSource[i]);
            }

            if (_self._sortedOrder) {
                var name = _self._sortedColumn;

                _self._pageSource.sort(sortAscDes);

                function sortAscDes(a, b) {
                    if (a[name] > b[name]) {
                        if (_self._sortedOrder == 'asc')
                            return 1;
                        else 
                            return -1;
                    } else if (a[name] < b[name]) {
                        if (_self._sortedOrder == 'asc')
                            return -1;
                        else 
                            return 1;
                    }
                    return 0;
                };
            }
        },

        _buildTable: function () {
            var table = _self._tableTemplate(_self._pageSource, _self._options.columnNames, _self._options.columnWidths);
            _self._table = $(table);
            _self._addTableEvent();
        },

        _buildPagenav: function() {
            var page = _self._pageNavTemplate(_self._currentPage, _self._startPage, _self._endPage, _self._totalPages);
            _self._pagenav = $(page);
            _self._addPagenavEvent();
        },

        _addPagenavEvent: function() {
            _self._pagenav.click(function(event) {
                event.preventDefault();
                var source = $(event.target);
                if (source.attr('pos') == '0') {
                    _self._currentPage = Math.max(_self._startPage - 5, 1);
                } else if (source.attr('pos') == '6') {
                    _self._currentPage = Math.min(_self._startPage + 5, _self._totalPages);
                } else {
                    var p = parseInt(source.text(), 10);
                    if (p) {
                        _self._currentPage = p;
                    }
                }
                _self._refreshData('pagenav.click');
            });
        },

        _addTableEvent: function() {
            var theader = _self._table.find("thead");
            var tbody = _self._table.find("tbody");
            theader.click(function(event) {
                event.preventDefault();
                var source = $(event.target);
                if (source.tagName != 'th') {
                    source = source.closest('th');
                }
                _self._sortedColumn = source.attr('name');

                if (_self._sortedColumn && isColumnSortable(_self._sortedColumn)) {
                    if (!_self._sortedOrder)
                        _self._sortedOrder = 'asc';
                    else if (_self._sortedOrder == 'asc')
                        _self._sortedOrder = 'des';
                    else 
                        _self._sortedOrder = null;
                }
                _self._refreshData('head.click');
            });

            function isColumnSortable(name) {
                for (var i=0; i<_self._options.columnSortables.length; i++) {
                    if (_self._options.columnSortables[i] == name)
                        return true;
                }
                return false;
            };
        },

        _fixSortedHeader: function() {
            var node = _self._table.find('[name=' + _self._sortedColumn + ']'); 
            var span = node.find('span.glyphicon');
            span.removeClass('glyphicon-chevron-up glyphicon-chevron-down sort-null sort-asc sort-des');

            if (!_self._sortedOrder) 
                span.addClass('glyphicon-chevron-up sort-null');
            else if (_self._sortedOrder == 'asc')
                span.addClass('glyphicon-chevron-up sort-asc');
            else
                span.addClass('glyphicon-chevron-down sort-des');
        },

        _showLoading: function() {
            var width = (_self.$element.width() < _self._options.width) ? _self._options.width : _self.$element.width();
            var height = (_self.$element.height() < _self._options.height) ? _self._options.height : _self.$element.height();
            _self.$element.empty();
            _self.$element.append($('<div class="loading"></div>'));
            //_self.$element.width(width);
            //_self.$element.height(height);
        },

        _hideLoading: function() {
            _self.$element.empty();
        },

        _pageNavTemplate: function(currentpage, pagestart, pageend) {
            var htemplate = _.template('<div class="clearfix"><div class="pull-right"><% if (page == 1) { \
                            %><ul class="pagination"><li class="disabled"><span>&laquo;</span></li><% \
                            } else { \
                            %><ul class="pagination"><li><a href="#" pos="0">&laquo;</a></li><% \
                            } %>');
            var header = htemplate({page: currentpage});

            var ptemplate = _.template('<% var idx = 1; \
                            for(i=start; i<=end; ++i) { if (page == i) { \
                                %><li class="active"><span pos="<%= idx %>"><%= i %></span></li><% \
                            } else { \
                                %><li><a href="#" pos="<%= idx %>"><%= i %></a></li><% } idx++; } \
                            %>');
            var page = ptemplate({page: currentpage, start: pagestart, end: pageend});

            var ttemplate = _.template('<% if (page == last) { \
                                %><li class="disabled"><span pos="6">&raquo;</span></li><% \
                            } else { \
                                %><li><a href="#" pos="6">&raquo;</a></li><% \
                            } %></ul></div></div>');
            var tail = ttemplate({page: currentpage, last: pageend});
            return header + page + tail;
        },

        _tableTemplate: function(dataSource, columnNames, columnWidths) {
            var hstart = '<table class="table table-striped table-bordered table-hover"><thead><tr>';
            var hspan = '<div class="sort-container pull-right"><span class="glyphicon glyphicon-chevron-up sort-null"></span>';
            var htail = '</tr></thead>';
            var bstart = '<tbody>';
            var btail = '</tbody></table>';

            var htemplate = _.template('<% for (var i=0; i<Names.length; i++) { \
                            if (Widths) { \
                                %><th name="<%= Names[i] %>" width="<%= Widths[i] %>"><%= Names[i] + SortSpan %></th><% \
                            } else { \
                                %><th name="<%= Names[i] %>"><%= Names[i] + SortSpan %></th><% \
                            } } %>');
            var header = hstart + htemplate({Names: columnNames, Widths: columnWidths, SortSpan: hspan}) + htail;

            var btemplate = _.template('<% for (var i=0; i<Source.length; i++) { \
                                %><tr><% \
                                for (var j=0; j<Names.length; j++) { \
                                    %><td><%= Source[i][Names[j]] %></td><% } \
                                %></tr><% \
                            } %>');
            var body = bstart + btemplate({Source: dataSource, Names: columnNames}) + btail;
            return header + body;
        },

        _defaults: {
            pageSize: 10,
            columnNames: null,
            columnLabels: null,
            columnWidths: null,
            columnWidths: null,
            columnSortables: null,
            sortedColumn: null,
            sortedOrder: null,
            pageNumber: 1,
            dataSource: null,
            width: 250,
            height: 200
        },

        // Public Methods - calling style on already instantiated grids:
        // $("#grid").PageTable("refresh", {dataSource: data})
        refresh: function(data) {
            this._refreshData(data);
        },
    };



    $.fn[pluginName] = function (options) {
        var functionArguments = arguments;
        return this.each(function () {
            var data = $.data(this, "plugin_" + pluginName);
            var isMethodCall = functionArguments.length > 0 && (typeof functionArguments[0] == 'string' || functionArguments[0] instanceof String);
            if (!data || !isMethodCall) {
                $.data(this, "plugin_" + pluginName, new PageTable( this, options ));
            } else {
                data[functionArguments[0]].apply(data, Array.prototype.slice.call(functionArguments,1));
            }
        });
    };

    $.fn[pluginName].Constructor = PageTable;

    $.fn[pluginName].noConflict = function () {
        $.fn[pluginName] = oldpluginName;
        return this;
    };
})(jQuery);

