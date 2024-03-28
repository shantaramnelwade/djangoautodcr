(function ($) {
  // build: commit c09a8f6
  !(function (e) {
    "function" == typeof define && define.amd
      ? define(["jquery"], e)
      : e(jQuery);
  })(function (e) {
    var t;
    e &&
      e.fn &&
      e.fn.select2 &&
      e.fn.select2.amd &&
      (t = e.fn.select2.amd.define),
      t(
        "select2/multi-checkboxes/dropdown",
        [
          "select2/utils",
          "select2/dropdown",
          "select2/dropdown/search",
          "select2/dropdown/attachBody",
        ],
        function (e, t, n, s) {
          return e.Decorate(e.Decorate(t, n), s);
        }
      ),
      t(
        "select2/multi-checkboxes/results",
        ["jquery", "select2/utils", "select2/results"],
        function (l, e, t) {
          function n() {
            n.__super__.constructor.apply(this, arguments);
          }
          return (
            e.Extend(n, t),
            (n.prototype.highlightFirstItem = function () {
              this.ensureHighlightVisible();
            }),
            (n.prototype.bind = function (e) {
              e.on("open", function () {
                var e = this.$results
                  .find(".select2-results__option[aria-selected]")
                  .filter("[aria-selected=true]");
                (e.length, e).first().trigger("mouseenter");
              }),
                n.__super__.bind.apply(this, arguments);
            }),
            (n.prototype.template = function (e, t) {
              var n = this.options.get("templateResult"),
                s = this.options.get("escapeMarkup"),
                i = n(e, t);
              l(t).addClass("multi-checkboxes_wrap"),
                null == i
                  ? (t.style.display = "none")
                  : "string" == typeof i
                  ? (t.innerHTML = s(i))
                  : l(t).append(i);
            }),
            n
          );
        }
      ),
      t(
        "select2/multi-checkboxes/selection",
        [
          "select2/utils",
          "select2/selection/multiple",
          "select2/selection/placeholder",
          "select2/selection/single",
          "select2/selection/eventRelay",
        ],
        function (e, t, n, s, i) {
          var l = e.Decorate(t, n);
          return (
            ((l = e.Decorate(l, i)).prototype.render = function () {
              return s.prototype.render.call(this);
            }),
            (l.prototype.update = function (e) {
              var t = this.$selection.find(".select2-selection__rendered"),
                n = "";
              if (0 === e.length) n = this.options.get("placeholder") || "";
              else {
                var s = {
                  selected: e || [],
                  all: this.$element.find("option") || [],
                };
                n = this.display(s, t);
              }
              t.empty().append(n), t.prop("title", n);
            }),
            l
          );
        }
      );
  });
  //

  $.fn.select2.amd.require(
    [
      "select2/multi-checkboxes/dropdown",
      "select2/multi-checkboxes/selection",
      "select2/multi-checkboxes/results",
    ],
    function (DropdownAdapter, SelectionAdapter, ResultsAdapter) {
      $(".select2").select2({
        //   placeholder: "Select",
        closeOnSelect: false,
        templateSelection: function (data) {
          return (
            "Selected " + data.selected.length + " out of " + data.all.length
          );
        },
        dropdownAdapter: DropdownAdapter,
        selectionAdapter: SelectionAdapter,
        resultsAdapter: ResultsAdapter,
      });
    }
  );
})(jQuery);
