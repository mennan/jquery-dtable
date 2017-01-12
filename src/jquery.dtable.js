/* jQuery Data Table Plugin
 * Developed by Selçuk Ermaya
 * Version : v1.0.1
 * http://www.selcukermaya.com
 * Fork from Git
 * https://github.com/se/jquery-dtable
 * or Visit me on Github
 * http://www.github.com/se */

(function ($) {

    $.fn.dtable = function (options) {
        var $this = $(this);

        var $table = $this.data("dtable");

        if ($table) {
            return $table;
        }

        var events;

        if (!options) {
            if (typeof options.events != "undefined") {
                events = options.events;
                delete options.events;
            }
        }

        $table = $.extend(true, {}, $.fn.dtable.defaults, options);

        if (events) {
            if (events.loaded && $.isFunction(events.loaded)) {
                $table.events.loaded(events.loaded);
            }
        }

        $table.element = $this;

        $this.data("dtable", $table);

        console.log("1.");
        console.log($this.data("dtable"));

        $.proxy($this.data("dtable").methods.init, $this.data("dtable")).call();

        return $this.data("dtable");
    };

    $.fn.dtable.defaults = {
        url : null,
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
                

                $(options.elements.filter, options.element).find("[data-field]").on("change", $.proxy(options.methods.load, options));

                var th = '<a href="#" class="btn btn-xs btn-green-alt" id="data_btn_filter"><i class="fa fa-filter"></i></a><a id="data_loading" href="#" class="btn btn-default btn-xs disabled text-success"><i class="fa fa-spin fa-refresh fa-spin-5x"></i></a>';
                $("thead th:first", options.element).append(th).addClass("text-left");

                $(options.elements.filtershowhide, options.element).on("click", function (event) {
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
                            var asc = head.data("asc");

                            $('[data-sort="true"]', options.element).each(function () {
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

                $(options.elements.loading, options.element).removeClass("hidden");
                $.ajax({
                    type: "POST",
                    contentType: "application/json;",
                    url: options.url,
                    data: JSON.stringify(model),
                    dataType: "json",
                    cache: false,
                    context: options,
                    error: function (status) {
                        if (console) {
                            console.log(status);
                        }
                    },
                    success: function (result) {
                        options.data = result.Value;

                        if (result.IsSuccess) {
                            $("tbody", options.element).empty();
                            if (result.Value.Data) {
                                var rendered = $(options.templates.row).render(result.Value.Data);
                                var html = $(rendered).wrap("tbody");
                                options.element.append(html);
                            }

                            if (!options.element.find("tfoot").size()) {
                                options.element.append("<tfoot/>");
                            }

                            options.element.find("tfoot tr[data-row-type='status']").remove();
                            var colSize = options.element.find("thead th").length;
                            options.element.find("tfoot").append("<tr data-row-type='status'><td colspan='" + colSize + "'></td></tr>");
                            options.element.find("tfoot tr[data-row-type='status'] td").html($(options.templates.status).render(result.Value));

                            options.element.data("loaded", true);

                            var paginationSelector = $(options.elements.pagination, options.element);
                            paginationSelector.find("li[data-page]").addClass("hidden");

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

                            paginationSelector.find("li[data-page]").each(function (index) {
                                if (index >= minIndex && index < maxIndex) {
                                    $(this).removeClass("hidden");
                                }
                            });

                            paginationSelector.find("#data_first_page").off("click").on("click", function (e) {
                                e.preventDefault();
                                paginationSelector.find("li[data-page]:first a").trigger("click");
                            });
                            paginationSelector.find("#data_last_page").off("click").on("click", function (e) {
                                e.preventDefault();
                                paginationSelector.find("li[data-page]:last a").trigger("click");
                            });
                            paginationSelector.find("li[data-page] a").off("click").on("click", function (e) {
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
                        var settings = this;
                        $(settings.elements.loading, settings.element).addClass("hidden");

                        $(settings.events._loaded).each(function () {
                            if ($.isFunction(this)) {
                                $.proxy(this, settings.element).call();
                            }
                        });
                    }
                });
            }
        }
    };
}(jQuery));