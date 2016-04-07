/*@require common:superGrid.less*/
var Backbone = require('backbone');
var $ = Backbone.$;
var _ = require('underscore');
var ScrollProxy = require('common:scrollProxy.view');
var log = require('log');


var SuperGridCP = {
    DefaultOptions : {
        // 行高
        rowHeight: 25,
        // 是否显示标签
        showLabel: true,
        // 选择控件代理
        checkboxDelegate: null,
        // 拖拽选中
        dragSelectable: false,
        // 展现选择控件代理
        showCheckboxDelegate: true
    },
    EVENT : {
        RENDER_START : 'renderStart',
        RENDER_END : 'renderEnd',
        ROW_SELECTED : 'selected',
        ROW_UNSELECTED : 'unselected',
        ROW_SELECTED_ALL : 'allselected'
    }
};


var SuperGrid = Backbone.View.extend({
    template : __inline('../templates/superGrid.mustache'),
    /**
     *
     * @param {Object} options
     * @param {Array} options.scheme
     */
    initialize: function (options) {
        // 配置信息
        this.options = _.defaults(options,SuperGridCP.DefaultOptions);
        // 渲染模板
        this.render();
        // 全选
        this.onSelectAll = _.bind(this.onSelectAll, this);
        // 代理容器
        var $proxyContainer = this.$('.proxy-container');
        this.scrollProxy = new ScrollProxy({
            el: $proxyContainer,
            rowHeight : this.options.rowHeight,
            length : this.collection.length
        });

        // 选择全部
        this.$allCheckbox = this.options.checkboxDelegate || null;
        this.listenTo(this.scrollProxy,ScrollProxy.EVENT.renderOneScreen,this.renderList);
        // collection发生改变，更新表格
        this.listenToCollection();
        this.buildGridHeader();
        if (!this.options.showLabel) {
            this.$('header').remove();
            $proxyContainer.css('top', 0);
        }
        $proxyContainer.on('click', _.bind(this.onSelectedRow, this));
        if (this.options.dragSelectable) {
            $(document).on('mousedown', _.bind(this.onDragSelect, this));
        }
        $(window).on('resize', _.bind(this.update, this));
    },

    render : function(){
        this.$el.html(this.template());
    },

    onDragSelect: function (e) {
        var $target = $(e.target);
        var $pxyCon = this.$('.proxy-container');

        //mousedown 选择列表范围内直接退出
        if (!$pxyCon[0].contains($target[0])) {
            return;
        }

        var $doc = $(document);
        var collection = this.collection;
        //获取当前选取的行元素
        var $row = $target.parents('.i-grid-row');
        //当前选取的行元素ID
        var startId = $row.attr('data-id');
        //当前选取的数据
        var startModel = collection.get(startId);
        //数据所在列表中的索引
        var startIndex = collection.indexOf(startModel);

        var epageY = e.pageY;

        var watchMove = null;

        var mouseMove = _.bind(function (e) {
            e.preventDefault();

            var $r = $(e.target).parents('.i-grid-row');
            var mid = $r.attr('data-id');

            var spx = this.scrollProxy;

            var moveModel = collection.get(mid);
            var moveIndex = collection.getIndex(moveModel);

            collection.each(function (model) {
                model.set('selected',false,{silent : true});
            });


            //相对容器底部的偏移量
            var offsetBottomY = e.pageY - window.innerHeight;
            var offsetLastPageY = e.pageY - epageY;
            var offsetProxyY = $pxyCon.offset().top;

            var models = [];

            if (offsetBottomY > 0) {
                if (offsetLastPageY > 0) {
                    this.scrollProxy.onMouseWheel({
                        originalEvent: {
                            wheelDelta: -120
                        }
                    });
                }
                models = collection.models.slice(startIndex, spx.getIndex() + spx.getOneScreenNum());
            } else if (e.pageY < offsetProxyY) {
                if (offsetLastPageY < 0) {
                    this.scrollProxy.onMouseWheel({
                        originalEvent: {
                            wheelDelta: 120
                        }
                    });
                }
                models = collection.models.slice(spx.getIndex(), startIndex);
            } else {
                var sx = Math.min(moveIndex, startIndex);
                var ex = Math.max(moveIndex, startIndex);

                models = collection.models.slice(sx, ex);
            }
            models.each(function (model) {
                model.set('selected',true,{silent : true});
            });
            this.renderList({
                index: spx.getIndex(),
                screenNum: spx.getOneScreenNum()
            });

            epageY = e.pageY;
        }, this);

        var mouseup = _.bind(function (e) {
            $doc.off('mousemove', mouseMove);
            $doc.off('mouseup', mouseup);
        }, this);

        $doc.on('mousemove', mouseMove);
        $doc.on('mouseup', mouseup);
    },

    onSelectedRow: function (evt) {
        var $target = $(evt.target);
        var $row = $target.parents('.i-grid-row');
        var checkbox = $row.find('input')[0];
        var modelId = $row.attr('data-id');
        var curModel = this.collection.get(modelId);

        if ($row.length === 0 || !checkbox) {
            return;
        }


        //非点击CHECKBOX 列的处理
        if (evt.target.tagName.toLowerCase() !== 'input' && !$target.hasClass('i-grid-checkbox')) {

            if (this.options.multiSelectable) {
                checkbox.checked = !checkbox.checked;
                this.collection.setSelected(modelId, checkbox.checked);
                $row[checkbox.checked ? 'addClass' : 'removeClass']('selected');
                this.trigger(checkbox.checked ? SuperGridCP.EVENT.ROW_SELECTED : SuperGridCP.EVENT.ROW_UNSELECTED, curModel);
            } else {
                this.collection.clearSelected();
                this.collection.setSelected(modelId, true);

                var rows = this.getRowElements();
                rows.forEach(function (row) {
                    row.rowElement.find('input').prop('checked', false);
                    row.rowElement['removeClass']('selected');
                });
                checkbox.checked = true;
                $row['addClass']('selected');

                this.collection.setSelectedHistory(modelId, checkbox.checked);
                this.trigger(SuperGridCP.EVENT.ROW_SELECTED, curModel);
            }

            //点击checkbox列
        } else {
            if ($target.hasClass('i-grid-checkbox')) {
                checkbox.checked = !checkbox.checked;
            }
            this.collection.setSelectedHistory(modelId, checkbox.checked);
            this.collection.setSelected(modelId, checkbox.checked);

            $row[checkbox.checked ? 'addClass' : 'removeClass']('selected');
            this.trigger(checkbox.checked ? SuperGridCP.EVENT.ROW_SELECTED : SuperGridCP.EVENT.ROW_UNSELECTED, curModel);
        }


        if (this.$allCheckbox.length) {
            this.$allCheckbox.prop('checked', this.collection.hasSelectedAll());
        }
    },

    onSelectAll: function (e) {
        var checked = this.$allCheckbox.prop('checked');
        if (this.collection.size() === 0) {
            e.preventDefault();
            return;
        }
        this.setAllSelect(checked);
    },

    setAllSelect: function (checked) {
        this.collection.setSelectedAll(checked);
        var rows = this.getRowElements();
        rows.forEach(function (row) {
            row.rowElement.find('input').prop('checked', !!checked);
            row.rowElement[checked ? 'addClass' : 'removeClass']('selected');
        });
        this.trigger(SuperGrid.EVENT.ROW_SELECTED_ALL, checked);
    },

    buildGridHeader: function () {
        if (this.options.scheme) {
            var mls = this.options.scheme || [];
            this.$header = this.$('header');

            mls.forEach(function (m) {
                var colLabel = $('<div class="i-grid-label"/>');
                if (m.width == 'flex') {
                    colLabel[0].style.webkitBoxFlex = 1;
                } else {
                    colLabel.css('width', m.width || 14);
                }

                if (m.type === 'checkbox') {
                    //全选checkbox可以使代理， 交由其他 checkbox元素处理
                    if (!this.$allCheckbox && this.options.showCheckboxDelegate) {
                        this.$allCheckbox = $('<input type="checkbox"/>');
                        // 在header中创建一个全选
                        colLabel.append(this.$allCheckbox);
                    }
                    this.$allCheckbox && this.$allCheckbox.on('click', this.onSelectAll);
                    colLabel.addClass('i-grid-checkbox');
                } else {
                    colLabel.html(m.label);
                }

                var pack = m.pack || 'left';
                colLabel[0].style.webkitBoxPack = pack;

                this.$header.append(colLabel);
            }, this);
        }
    },

    setAllCheckboxDelegate: function (delegate) {
        this.$allCheckbox = delegate;
        this.$allCheckbox.off('click');
        this.$allCheckbox.on('click', this.onSelectAll);
        this.$allCheckbox.prop('checked', this.collection.hasSelectedAll());
    },

    getRowElements: function () {
        // 每一屏行数
        var rowNums = this.scrollProxy.getOneScreenNum();
        if (this.domRows && rowNums === this.domRows.length) {
            return this.domRows;
        }

        var fragment = document.createDocumentFragment();
        this.domRows = this.domRows || [];

        rowNums = rowNums - this.domRows.length;

        for (var i = 0; i < rowNums; i++) {

            //缓存的dom元素
            var domElement = $('<div class="i-grid-row" style="display:none"></div>');
            var rowMap = {
                rowElement: domElement,
                columns: []
            };
            this.domRows.push(rowMap);

            //创建列元素容器
            this.options.scheme.forEach(function (m) {
                var column = $('<div class="i-grid-column"></div>');
                rowMap.columns.push(column);

                if (m.width === 'flex') {
                    column[0].style.webkitBoxFlex = 1;
                } else {
                    column.width(m.width);
                }


                if (m.type == 'checkbox') {
                    column.addClass('i-grid-checkbox');
                    column.html('<input type="checkbox"/>');
                }
                var pack = m.pack || 'left';
                column[0].style.webkitBoxPack = pack;

                domElement.append(column);
            });

            fragment.appendChild(domElement[0]);
            domElement.height(this.options.rowHeight);
        }
        this.scrollProxy.addContent(fragment);
        return this.domRows;
    },
    getScreenModels: function (index, nums) {
        return this.collection.models.slice(index, index + nums);
    },
    renderList: function (ev) {
        var oneList = this.getScreenModels(ev.index, ev.screenNum);
        this.renderOrder = this.renderOrder || [];
        this.renderOrder.push(oneList);
        if (!this.aniFrame) {
            var render = function () {
                var me = this;
                var rowList = this.getRowElements();
                var cpList = rowList.slice(0, rowList.length);
                var renderList = this.renderOrder.shift();
                if (!renderList) {
                    clearTimeout(this.aniFrame);
                    this.aniFrame = null;
                    return;
                }
                this.trigger(SuperGridCP.EVENT.RENDER_START, renderList);

                var _startTime = new Date();


                renderList.forEach(function (model, index) {
                    var row = cpList.shift();
                    var checkbox = row.rowElement.find('input');

                    row.rowElement.attr('data-id', model.get('id'));

                    var renderRow = function () {
                        me.options.scheme.forEach(function (m, i) {
                            var column = row.columns[i];

                            if (m.type !== 'checkbox') {
                                if (m.type == 'view') {

                                    var vw = column.data('view');
                                    if(!vw){
                                        vw = new m['view']({
                                            model : model,
                                            el : column
                                        });
                                        column.data('view',vw);
                                    }
                                    else{
                                        vw.updateModel(model)
                                    }
                                } else {
                                    column.html(model.get(m['name']));
                                }
                            } else {
                                checkbox[0].checked = model.isSelected();
                            }
                        });
                    };

                    renderRow();

                    if (checkbox.length !== 0) {
                        var selected = model.isSelected();
                        row.rowElement[selected ? 'addClass' : 'removeClass']('selected');
                    }

                    row.rowElement.css('display', '-webkit-box');

                    //model.on('change',function() {
                    //    if(this.changedAttributes().length == 1 && this.hasChanged('icon')) return;
                    //    var $row = $('[data-id="' + this.get('id') + '"]');
                    //    if ($row.size() > 0) {
                    //        renderRow();
                    //    }
                    //});

                });

                cpList.forEach(function (row) {
                    row.rowElement.css('display', 'none');
                });

                var spx = this.scrollProxy;

                if (spx.getIndex() + spx.getOneScreenNum() - 1 >= spx.length) {
                    rowList[rowList.length - 1].rowElement[0].scrollIntoView();
                } else if (spx.getIndex() <= 1) {
                    rowList[0].rowElement[0].scrollIntoView();
                }

                //console.log('REND_END',new Date() - _startTime );
                this.trigger(SuperGridCP.EVENT.RENDER_END, renderList);


                this.aniFrame = setTimeout(_.bind(render, this), 30);
                this.$allCheckbox && this.$allCheckbox.prop('checked', this.collection.hasSelectedAll());
            };
            this.aniFrame = setTimeout(_.bind(render, this), 30);
        }
    },
    /**
     *@description modify by liujintao 2014-05-14  */
    scrollToIndex: function (index) {
        //如果collection的models长度小于一屏数目，直接返回
        if (this.collection.models.length < this.scrollProxy.getOneScreenNum()) {
            return;
        }
        this.renderList({
            index: index,
            screenNum: this.scrollProxy.getOneScreenNum()
        });
        this.scrollProxy.setScrollTopByIndex(index);
    },
    update: function () {
        // 设置scrollProxy的高度
        this.scrollProxy.setLength(this.collection.length);
        // 渲染表格
        this.renderList({
            index: this.scrollProxy.getIndex(),
            screenNum: this.scrollProxy.getOneScreenNum()
        });
        if (this.$allCheckbox && this.collection.size() <= 0) {
            this.$allCheckbox.prop('checked', false);
            this.trigger(SuperGridCP.EVENT.ROW_SELECTED_ALL, false);
        }
    },
    setCollection: function (collection) {
        this.collection = collection;
        this.scrollProxy.setLength(collection.size());
        this.listenToCollection();
    },
    listenToCollection : function(){
        this.listenTo(this.collection,'add remove reset',this.update);
        return this;
    },
    stopListeningCollection : function(){
        this.stopListening(this.collection);
        return this;
    }
},SuperGridCP);

module.exports = SuperGrid;

