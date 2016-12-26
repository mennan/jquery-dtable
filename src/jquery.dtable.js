/* jQuery Data Table Plugin
 * Developed by Selçuk Ermaya
 * Version : v1.0
 * http://www.selcukermaya.com
 * Fork from Git
 * https://github.com/se/jquery-dtable
 * or Visit me on Github
 * http://www.github.com/se */

(function ($) {

    $.fn.dtable = function (options) {
        var table = this.data("dtable");

        if (!table) {
            var events;

            if (typeof options.events != "undefined") {
                events = options.events;
                delete options.events;
            }

            table = $.extend(true, $.fn.dtable.defaults, options);

            if (events) {
                if (events.loaded && $.isFunction(events.loaded)) {
                    table.events.loaded(events.loaded);
                }
            }

            table.element = this;
            this.data("dtable", table);
            $.proxy(table.methods.init, table).call();
        }

        return table;
    };

    $.fn.dtable.defaults = {
        elements: {
            loading: "#data_loading",
            pagination: "#data_pagination",
            filtershowhide: "#data_btn_filter",
            filter: "#data_filter",
            status: "#data_status"
        },
        templates: {
            row: "#data_row_template",
            status: "#data_status_template"
        },
        data: null,
        element: null,
        currentpage: 0,
        visiblepage: 11,
        sort: [],
        filters: [],
        events: {
            _loaded: [],
            loaded: function (evt) {
                this._loaded.push(evt);
            }
        },
        methods: {
            init: function () {
                var options = this;

                $("[data-field]", options.elements.filter).on("change", $.proxy(options.methods.load, options));

                var th = '<a href="#" class="btn btn-xs btn-green-alt" id="data_btn_filter"><i class="fa fa-filter"></i></a><a id="data_loading" href="#" class="btn btn-default btn-xs disabled text-success"><i class="fa fa-spin fa-refresh fa-spin-5x"></i></a>';
                $("thead th:first", options.element).append(th).addClass("text-left");

                $(options.elements.filtershowhide).on("click", function (event) {
                    event.preventDefault();
                    $(options.element).find('[data-js="filter"]').toggleClass("hidden");
                });

                $("thead th[data-sort=true]", options.element).each(function () {
                    var header = $(this).text();
                    if (header.length > 0) {
                        var a = $("<a href='#'/>").text($(this).text());
                        $(this).html(a);
                        a.on("click", function (headclick) {
                            headclick.preventDefault();
                            var head = $(this).parent();
                            var field = head.data("field");
                            var asc = head.data("asc");

                            $('[data-sort="true"]').each(function () {
                                $(this).removeData("asc");
                                $(this).find("i").remove();
                            });

                            if (typeof asc == "undefined") {
                                asc = 1;
                            } else {
                                asc = asc === 1 ? 0 : 1;
                            }

                            head.data("asc", asc);

                            if ($(this).find("i").size() === 0) {
                                $(this).append("<i style='margin-left:5px;'/>");
                            }

                            var i = $(this).find("i");

                            if (asc === 1) {
                                i.attr("class", "");
                                i.attr("class", "fa fa-angle-up");
                            } else {
                                i.attr("class", "");
                                i.attr("class", "fa fa-angle-down");
                            }

                            $.proxy(options.methods.load, options).call();
                        });
                    }
                });

                $.proxy(options.methods.load, options).call();
            },
            load: function () {
                var options = this;

                options.sorts = null;
                options.sorts = [];
                options.filters = options.filters || [];

                var tr = $("[data-js='filter']", options.element);
                if (tr.size() === 0) {
                    tr = $("<tr data-js='filter' class='hidden' />");

                    $("thead tr:first th", options.element).each(function () {
                        if ($(this).data("field")) {
                            var th = tr.append("<th/>").find("th:last");
                            var filterType = $(this).data("filter-type");
                            var inputField = null;

                            if (filterType === "dropdown") {
                                var dataFilterData = $(this).data("filter-data");
                                if (dataFilterData) {
                                    var data = eval(dataFilterData);
                                    var select = $("<select data-field='" + $(this).data("field") + "' class='form-control input-sm'/>");
                                    $(data).each(function () {
                                        select.append("<option value='" + this.Id + "'>" + this.Title + "</option>");
                                    });
                                    inputField = select;
                                }
                            } else {
                                inputField = $("<input data-field='" + $(this).data("field") + "' placeholder='Type and search' class='form-control input-sm' type='text'/>");
                            }
                            if (inputField) {
                                th.append(inputField);
                            }
                        } else {
                            tr.append("<th/>");
                        }
                    });
                    $("thead", options.element).append(tr);

                    $("thead th [data-field]", options.element).on("change", function () {
                        $.proxy(options.methods.load, options).call();
                    });
                }

                $("th[data-sort=true]", options.element).each(function () {
                    var field = $(this).data("field");
                    var asc = $(this).data("asc");

                    if (typeof asc != "undefined") {
                        options.sorts.push({ column: field, asc: asc });
                    }
                });

                $("thead [data-field]", options.element).each(function () {
                    var field = $(this).data("field");
                    var value = $(this).val();
                    if (value) {
                        $(options.filters).each(function (i) {
                            if (this.column === field) {
                                options.filters.splice(i, 1);
                            }
                        });

                        options.filters.push({
                            column: field,
                            value: value
                        });
                    } else {
                        $(options.filters).each(function (i) {
                            if (this.column === field) {
                                options.filters.splice(i, 1);
                            }
                        });
                    }
                });

                var model = { CurrentPage: options.currentpage, Sorts: options.sorts, Filters: options.filters };

                $(options.elements.loading).removeClass("hidden");
                $.ajax({
                    type: "POST",
                    contentType: "application/json;",
                    url: options.url,
                    data: JSON.stringify(model),
                    dataType: "json",
                    cache: false,
                    error: function (status) {
                        // alert("Data load error.");
                    },
                    success: function (result) {
                        options.data = result.Value;

                        if (result.IsSuccess) {
                            $("tbody", options.element).empty();
                            if (result.Value.Data) {
                                var html = $($(options.templates.row).render(result.Value.Data)).wrap("tbody");
                                options.element.append(html);
                            }

                            $(options.elements.status).remove();
                            var footer = $(options.templates.status).render(result.Value);
                            options.element.parent().append(footer);

                            options.element.data("loaded", true);

                            $("li[data-page]", options.elements.pagination).addClass("hidden");

                            var dd = (options.visiblepage - 1) / 2;
                            var minIndex = options.currentpage - dd;
                            var maxIndex = options.currentpage + dd;

                            if (minIndex < 0) {
                                maxIndex += -1 * minIndex;
                                minIndex = 0;
                            }

                            if (maxIndex > options.data.PageCount) {
                                minIndex -= maxIndex - options.data.PageCount;
                            }

                            if (minIndex < 0) {
                                minIndex = 0;
                            }

                            $("li[data-page]", options.elements.pagination).each(function (index) {
                                if (index >= minIndex && index < maxIndex) {
                                    $(this).removeClass("hidden");
                                }
                            });

                            $("#data_first_page").off("click").on("click", function (e) {
                                e.preventDefault();
                                $("li[data-page]:first", options.elements.pagination).find("a").trigger("click");
                            });
                            $("#data_last_page").off("click").on("click", function (e) {
                                e.preventDefault();
                                $("li[data-page]:last", options.elements.pagination).find("a").trigger("click");
                            });
                            $("li[data-page] a", options.elements.pagination).off("click").on("click", function (e) {
                                e.preventDefault();
                                var parent = $(this).parent();
                                if (!parent.hasClass("active")) {
                                    parent.parent().find("li").removeClass("active");
                                    parent.addClass("active");

                                    options.currentpage = parent.data("page");

                                    $.proxy(options.methods.load, options).call();
                                }
                            });
                        }
                    },
                    complete: function () {
                        $(options.elements.loading).addClass("hidden");

                        $(options.events._loaded).each(function () {
                            if ($.isFunction(this)) {
                                $.proxy(this, options.element).call();
                            }
                        });
                    }
                });
            }
        }
    };

}(jQuery));