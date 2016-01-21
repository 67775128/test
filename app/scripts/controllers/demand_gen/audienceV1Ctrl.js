Number.prototype.formatMoney = function(c, d, t) {
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "." : d, t = t == undefined ? "," : t, s = n < 0 ? "-" : "", i = parseInt(n = Math
            .abs(+n || 0).toFixed(c))
        + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


(function () {
        'use strict';

        angular.module('app')
            .controller('AudienceV1Ctrl', function ($scope, $http, $alert, $modal, topAlert, $aside, $filter, apiLsWeb,
                                                    $q, $timeout, style, msg, segmentsService) {
                //var userInfo;
                var infos = {};
                var userInfo;
                var selectedSegment = segmentsService.selectedSegment;

                function getUserInfo() {
                    var dtd = $.Deferred();//TODO
                    if (!userInfo) {
                        $.ajax({
                            type: 'get', //
                            url: apiLsWeb + 'lg/getLeadgenInfo?segmentId='+selectedSegment.id,
                            cache: false,
                            data: "",
                            dataType: 'json',
                            success: function (response) {
                                if (response.status!=200) {
                                    topAlert.addAlert("ERROR", response.statusInfo);
                                    return;
                                }
                                userInfo = response.data;
                                dtd.resolve(userInfo);
                            },
                            error: function () {
                                topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                                dtd.reject();
                            }
                        });
                    } else {
                        dtd.resolve(userInfo);
                    }
                    return dtd;
                }

                function saveSegment(params) {
                    var dtd = $.Deferred();
                    $.ajax({
                        type: 'post', //
                        url: apiLsWeb + 'lg/saveDgFilter',
                        contentType: "application/json;charset=utf-8",
                        data: $.stringify(params),
                        dataType: 'json',
                        success: function (response) {
                            if (response.status!=200) {
                                topAlert.addAlert("ERROR", response.statusInfo);
                                return;
                            }
                            dtd.resolve(response);
                        },
                        error: function () {
                            topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                            dtd.reject();
                        }
                    });
                    return dtd;
                }

                function deleteUserSegment(userInfo, segmentId) {
                    var dtd = $.Deferred();
                    $.ajax({
                        type: 'get',
                        url: apiLsWeb + 'lg/deleteDgFilter?&segmentId='+selectedSegment.id+'&filterId=' + segmentId + '&r=' + Math.random(),
                        dataType: 'json',
                        success: function (response) {
                            if (response.status!=200) {
                                topAlert.addAlert("ERROR", response.statusInfo);
                                return;
                            }
                            dtd.resolve(response);
                        },
                        error: function () {
                            topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                            dtd.reject();
                        }
                    });
                    return dtd;
                }

                function queryData(params) {
                    var dtd = $.Deferred();
                    $.ajax({
                        type: 'post', //
                        url: apiLsWeb + 'lg/queryData',
                        contentType: "application/json; charset=utf-8",
                        data: $.stringify(params),
                        dataType: 'json',
                        success: function (response) {
                            if (response.status!=200) {
                                topAlert.addAlert("ERROR", response.statusInfo);
                                return;
                            }
                            dtd.resolve(response);
                        },
                        error: function () {
                            topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                            dtd.reject();
                        }
                    });
                    return dtd;
                }

                function getCompanyCount(params) {
                    var dtd = $.Deferred();
                    $.ajax({
                        type: 'post', //
                        url: apiLsWeb + 'lg/getCompanyCount',
                        contentType: "application/json; charset=utf-8",
                        data: $.stringify(params),
                        dataType: 'json',
                        success: function (response) {
                            if (response.status!=200) {
                                topAlert.addAlert("ERROR", response.statusInfo);
                                return;
                            }
                            dtd.resolve(response);
                        },
                        error: function () {
                            // topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                            dtd.reject();
                        }
                    });
                    return dtd;
                }

                function getContactCount(params) {
                    var dtd = $.Deferred();
                    $.ajax({
                        type: 'post', //
                        url: apiLsWeb + 'lg/getContactCount',
                        contentType: "application/json; charset=utf-8",
                        data: $.stringify(params),
                        dataType: 'json',
                        success: function (response) {
                            if (response.status!=200) {
                                topAlert.addAlert("ERROR", response.statusInfo);
                                return;
                            }
                            dtd.resolve(response);
                        },
                        error: function () {
                            // topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                            dtd.reject();
                        }
                    });
                    return dtd;
                }

                function getInfos(userInfo, type,isRefresh) {
                    var dtd = $.Deferred();
                    if (type != 'getDemandGenFilter'||(type == 'getDemandGenFilter'&&!infos['getDemandGenFilter'])) {
                        $.ajax({
                            type: 'get', //
                            url: apiLsWeb + 'lg/' + type + '?segmentId='+selectedSegment.id+'&r=' + Math.random(),//todo
                            data: "",
                            dataType: 'json',
                            success: function (response) {
                                if (response.status!=200) {
                                    topAlert.addAlert("ERROR", response.statusInfo);
                                    return;
                                }
                                infos[type] = response.data;
                                dtd.resolve(infos[type]);
                            },
                            error: function () {
                                topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                                dtd.reject();
                            }
                        });
                    } else {
                        dtd.resolve(infos['getDemandGenFilter']);
                    }
                    return dtd;
                }
                $scope.$on('segmentChange', function(e,value){
                    selectedSegment = value.select;
                    init();
                });
                function init(){
                    $('#real-content').html('');
                    $.when(getUserInfo()).then(function (response) {
                        if (response.leadGenInfo&&response.leadGenInfo.status != 200) {//TODO
                            $('#no-data-cont').show();
                            $('#right-cont').hide();
                            return;
                        } else {
                            $('#no-data-cont').hide();
                            $('#right-cont').show();
                        }
                        var dtd = $.Deferred();
                        $.when(
                            getInfos(response, 'getDemandGenFilter'),
                            getInfos(response, 'getDgFilters')
                        ).then(function (getSegment, getSegments) {
                            var data = {};
                            data.getSegment = getSegment;
                            data.getSegments = getSegments;
                            dtd.resolve(data);

                        });
                        return dtd;
                    }).then(function (data) {
                        console.log(data);
                        if (!data) {
                            return;
                        }
                        var dtd = $.Deferred();
                        segmentRender('init', data, dtd);
                        return dtd;
                    }).then(function (type, data) {
                        console.log(data)
                        if (!data) {
                            return;
                        }
                        afterFilterRender(type, data);
                    });
                };
                //init();
                function segmentRender(type, data, dtd) {
                    var interText = doT.template($("#detailViewTpl").text());
                    var html = '';

                    function segmentFilter(response) {
                        var data = null;
                        if ($.isPlainObject(response)) {
                            data = {};
                            if (response.display) {
                                var hasMessyCode = textFilter(response.display);
                                if (hasMessyCode) {
                                    data = response;
                                } else {
                                    data = null;
                                }
                            } else {
                                for (var n in response) {
                                    data[n] = segmentFilter(response[n]);
                                }
                            }
                        } else if ($.isArray(response)) {
                            data = $.map(response, function (n, i) {
                                return segmentFilter(n);
                            });
                        } else {
                            data = response;
                        }
                        return data;
                    }

                    data.getSegment = segmentFilter(data.getSegment);
                    if (type == 'init') {
                        if (data.getSegments && data.getSegments.length > 0) {

                            for (var i = 0, ii = data.getSegments.length; i < ii; i++) {
                                html += interText({
                                    getSegment: data.getSegment,
                                    getSegments: data.getSegments[i]
                                });
                            }
                        }
                    } else {
                        html = interText(data);
                    }
                    // var $html = $(html);
                    $('#real-content').append(html);
                    if (dtd) {
                        dtd.resolve(type, data);
                    }
                }

                var revenueValueNum = {
                    '0': 0,
                    '$1M': 1000000,
                    '$5M': 5000000,
                    '$10M': 10 * 1000000,
                    '$25M': 25 * 1000000,
                    '$50M': 50 * 1000000,
                    '$100M': 100 * 1000000,
                    '$250M': 250 * 1000000,
                    '$500M': 500 * 1000000,
                    '$1B': 1 * 1000000000,
                    '$5B': 5 * 1000000000,
                    '$5B+': -1
                };
                var revenueNumIndex = {
                    '0': 0,
                    '1000000': 1,
                    '5000000': 2,
                    '10000000': 3,
                    '25000000': 4,
                    '50000000': 5,
                    '100000000': 6,
                    '250000000': 7,
                    '500000000': 8,
                    '1000000000': 9,
                    '5000000000': 10,
                    '-1': 11
                };
                var companySizeValueNum = {
                    '1': 1,
                    '10': 10,
                    '50': 50,
                    '200': 200,
                    '500': 500,
                    '1K': 1000,
                    '5K': 5000,
                    '10K': 10000,
                    '10K+': -1
                };
                var companySizeNumIndex = {
                    '1': 0,
                    '10': 1,
                    '50': 2,
                    '200': 3,
                    '500': 4,
                    '1000': 5,
                    '5000': 6,
                    '10000': 7,
                    '-1': 8
                };

                function textFilter(text) {
                    var reg = /[^A-z0-9\s\&\`\-\_\:\"\'\,\.]/g;
                    return text.search(reg) < 0 ? true : false;
                };

                function afterFilterRender(type, data) {
                    // need to set the segment'name
                    // need to set the keysTextareaTpl
                    var $html = $('#real-content .js-detailView');
                    var revenueValues = ['0', '$1M', '$5M', '$10M', '$25M', '$50M', '$100M', '$250M', '$500M', '$1B', '$5B', '$5B+'];
                    var companySizeValues = ['1', '10', '50', '200', '500', '1K', '5K', '10K', '10K+'];
                    if (type == 'init') {
                        var $rangeRevenue = $('.js-range-revenue');
                        var $rangeCompanySize = $('.js-range-company-size');
                        var $frequency = $('.js-frequency');

                        if (data.getSegments) {
                            $.each(data.getSegments, function (index, item) {
                                $($html.find('.js-range-revenue')[index]).ionRangeSlider({
                                    type: "double",
                                    grid: true,
                                    min_interval: 1,
                                    from: revenueNumIndex[item.company.revenue.startValue + ''],
                                    to: revenueNumIndex[item.company.revenue.endValue + ''],
                                    values: revenueValues
                                });
                                $($html.find('.js-range-company-size')[index]).ionRangeSlider({
                                    type: "double",
                                    grid: true,
                                    min_interval: 1,
                                    from: companySizeNumIndex[item.company.companySize.startValue + ''],
                                    to: companySizeNumIndex[item.company.companySize.endValue + ''],
                                    values: companySizeValues
                                });
                                var frequency = item.frequency ? item.frequency : 2;
                                var $frequencyBtn = $($frequency[index]).find('.js-dropdown-menu a');
                                if (frequency == 4) {
                                    $($frequencyBtn[1]).click();
                                } else if (frequency == 12) {
                                    $($frequencyBtn[2]).click();
                                };
                                var includeIds = item.contact.title.included;
                                var excludedIds = item.contact.title.excluded;
                                var $keySearchDropdownContent = $($html[index]).find('.js-keySearch-list-input .js-dropdown-content');
                                var $keysTextarea = $($html[index]).find('.js-keys-textarea');
                                if (includeIds.length > 0) {
                                    $($keySearchDropdownContent.find('a')[0]).click();
                                } else {
                                    if (excludedIds.length > 0) {
                                        $($keySearchDropdownContent.find('a')[1]).click();
                                    } else {
                                        $($keySearchDropdownContent.find('a')[0]).click();
                                    }
                                }

                                var $checkList = $($html[index]).find('.js-check-list');
                                var keyIndexMap = [
                                    ['company', 'industry', 0],
                                    ['company', 'state', 1],
                                    ['contact', 'function', 3],
                                    ['contact', 'level', 2]
                                ];
                                $.each(keyIndexMap, function (l, value) {
                                    var $checkboxList = $($checkList[value[2]]);
                                    var listArr = [];
                                    console.log(item[value[0]][value[1]].all)
                                    if (item[value[0]][value[1]].all) {

                                        $checkboxList.find('.js-checkbox').prop('checked', true);
                                        $checkboxList.find('.js-checkbox-all').prop('checked', true);
                                    } else {
                                        $.each(item[value[0]][value[1]].checkedData, function (i, n) {
                                            if (n.subItems) {
                                                if (n.all) {
                                                    $checkboxList.find('.js-checkbox[data-id="' + n.data.id + '"]').prop('checked', true);
                                                } else if (n.subItems.length > 0) {
                                                    $checkboxList.find('.js-checkbox[data-id="' + n.data.id + '"]').addClass('indeterminate');
                                                }
                                                $.each(n.subItems, function (ci, cn) {
                                                    $checkboxList.find('.js-checkbox[data-id="' + cn.id + '"]').prop('checked', true);
                                                });
                                            } else {
                                                $checkboxList.find('.js-checkbox[data-id="' + n + '"]').prop('checked', true);
                                            }
                                        });
                                    }
                                    $.each($checkboxList.find('.js-checkbox-parent'), function (i, n) {
                                        if ($(n).prop('checked')) {
                                            listArr.push(n);
                                        }
                                    });
                                    if (listArr.length > 0 && listArr.length == $checkboxList.find('.js-checkbox-parent').length) {
                                        $checkboxList.find('.js-checkbox-all').prop('checked', true);
                                    }
                                });
                                if(item.company.hasContact){
									$($($html[index]).find('.js-filter-type')[1]).prop('checked',true);
									filterTypeTab($($html[index]).find('.js-filter-type')[1]);
								}else {
									$($($html[index]).find('.js-filter-type')[0]).prop('checked',true);
									filterTypeTab($($html[index]).find('.js-filter-type')[0]);
								}
                            });
                        }
                    } else {
                        $html = $($html[$html.length - 1]);
                        $html.find('.js-range-revenue').ionRangeSlider({
                            type: "double",
                            grid: true,
                            from: 0,
                            to: 11,
                            min_interval: 1,
                            values: revenueValues
                        });
                        $html.find('.js-range-company-size').ionRangeSlider({
                            type: "double",
                            grid: true,
                            from: 0,
                            to: 8,
                            min_interval: 1,
                            values: companySizeValues
                        });
                        $html.find(".js-filter-list-item .js-checkbox").prop('checked', true);
                        $html.find(".js-filter-list-item .js-checkbox-all").prop('checked', true);
                        var $dropdownContent = $html.find('.js-keySearch-list-input .js-dropdown-content');
                        $($dropdownContent.find('a')[0]).click();
						$($html.find('.js-filter-type')[0]).prop('checked',true);
						filterTypeTab($html.find('.js-filter-type')[0],'add');
                    }
                    var $span = $html.find('.js-segment-name-span');

                    if($span.length>0){
                        $span.html($html.find('.js-segment-name').val());
                        if ($html.find('.js-segment-name').val().length > 0) {
                            $html.find('.js-segment-name').css('width', $span.width())
                        }
                    }

                    $('.js-filter-list-item').off('scroll');
                    $('.js-filter-list-item').on('scroll', function () {
                        $(this).find('.unfold').removeClass('unfold');
                    });
                    $.ajax({
                        type: 'get', //
                        url: apiLsWeb + 'lg/isRunAs',
                        dataType: 'json',
                        success: function (response) {
                            if (response.data) {
                                $('.js-export-drop-list').css({
                                    display: ''
                                });
                            }
                        }
                    })
                }

                $('#right-cont').undelegate();
                $(document).undelegate('body');
                $(window).off('resize');
                $(window).on('resize', function () {
                    $('.link-pop').popover("hide");
                    $('.js-check-list-li.unfold').removeClass('unfold');
                });
                $(document).delegate('body', "click", function (e) {
                    var e = window.event || e;
                    // stopBubble(e);
                    $.each($('.link-pop'), function (i, n) {
                        if (n != e.target) {
                            $(n).popover("hide");
                        }
                    });
                    var $needToCloseChildren = $('.js-check-list-li').filter(function (index, item) {
                        return $(e.target).parents('.js-check-list-li')[0] != item;
                    });
                    $needToCloseChildren.removeClass('unfold');
                });
                $('#right-cont').delegate('.js-unfold-btn', 'click', function () {
                    var $parents = $(this).parents('.js-segment-content');
                    if ($parents.hasClass("unfold")) {
                        $parents.removeClass('unfold');
                    } else {
                        $parents.addClass('unfold');
                    }
                });

                $('#right-cont').delegate('.js-remove', 'click', function () {
                    $(this).parent().remove();
                });

                $('#right-cont').delegate('.js-filter-list-tab a', 'click', function () {
                    if ($(this).hasClass('checked')) {
                        return;
                    }
					var checkedVal = $(this).parents('.js-detailView').find('.js-filter-type:checked').val();
                    var $tabBtn = $(this).parent().find('a');
					if(checkedVal == '1'&& this == $tabBtn[1]){
						return;
					}
                    var $filterListItem = $(this).parents('.js-segment-content').find('.js-filter-list-item');
                    var index = 0;
                    var _this = this;
                    $tabBtn.removeClass('checked');
                    $(this).addClass('checked');
                    $filterListItem.hide();
                    $.each($tabBtn, function (i, n) {
                        if (_this == n) {
                            index = i;
                        }
                    });
                    $($filterListItem[index]).show();
                    processData(this, 'save');
                });

                $('#right-cont').delegate('.js-show-all', 'click', function () {
                    var $checkList = $(this).parents('.js-check-list-content').find('.js-check-list');
                    if ($checkList.height() == 58) {
                        $checkList.css('height', 'auto');
                        $(this).html('Show Less');
                    } else {
                        $checkList.css('height', '');
                        $(this).html('Show More');
                    }

                });
                $('#right-cont').delegate('.js-dropdown-menu a', 'click', function () {
                    var $text = $(this).parents('.js-dropdown-content').find('.js-dropdown-toggle-text');
                    $text.html($(this).html());
                    console.log($(this), $(this).html())
                    $text.data('value', $(this).data('value'));
                    if ($(this).parents('.js-keySearch-list-input').length > 0) {
                        var $keysTextarea = $(this).parents('.js-keySearch-list-input').find('.js-keys-textarea li');
                        $keysTextarea.hide();
                        if ($(this).data('value') == '1') {
                            $($keysTextarea[0]).show();
                        } else if ($(this).data('value') == '2') {
                            $($keysTextarea[1]).show();
                        }
                    }

                });
                $('#right-cont').delegate('.js-frequency .js-dropdown-menu a', 'click', function () {
                    processData(this, 'save');

                });
                $('#right-cont').delegate('.js-check-list-li a', 'click', function () {
                    var $checkListLi = $(this).parents('.js-check-list-li');
                    var $children = $checkListLi.find('.js-check-list-children');
                    $children.css({
                        width: $checkListLi.find('div').width(),
                        // left:$(this).position().left-110,
                        top: $checkListLi.position().top + 18
                    });
                    if ($checkListLi.hasClass('unfold')) {
                        $checkListLi.removeClass('unfold');
                    } else {
                        $checkListLi.addClass('unfold');
                    }
                });
                $('#right-cont').delegate('.js-keySearch-input', 'keyup', function (event) {
                    var event = event || window.event;
                    if (event.keyCode == 13) {
                        var val = $.trim($(this).val());
                        if (!val) {
                            return;
                        }
                        var type = $(this).parents('.js-keySearch-list-input').find('.js-dropdown-toggle-text').data('value');
                        type = Number(type);
                        type--;
                        var $content = $(this).parents('.js-keySearch-list-input').find('.js-keys-textarea p');
                        var interText = doT.template($("#keysTextareaTpl").text());
                        var html = '';
                        html = interText([{
                            display: val
                        }]);
                        $($content[type]).append(html);
                        $(this).val('');
                    }

                });

                $('#right-cont').delegate('.js-keySearch-list-input .js-dropdown-toggle-text', 'click', function (event) {
                    var $input = $(this).parents('.js-keySearch-list-input').find('.js-keySearch-input');
                    var val = $.trim($input.val());
                    if (!val) {
                        return;
                    }
                    var type = $(this).data('value');
                    type = Number(type);
                    type--;
                    var $content = $(this).parents('.js-keySearch-list-input').find('.js-keys-textarea p');
                    var interText = doT.template($("#keysTextareaTpl").text());
                    var html = '';
                    html = interText([{
                        display: val
                    }]);
                    $($content[type]).append(html);
                    $input.val('');
                });


                $('#right-cont').delegate('.js-checkbox', 'click', function (event) {
                    var $children = $(this).parents('.js-check-list-li').find('.js-check-list-children .js-checkbox');
                    var $checkList = $(this).parents('.js-check-list');
                    var $checkbox = $checkList.find('.js-checkbox');
                    $(this).removeClass('indeterminate');
                    var checkedArr = [];
                    if ($(this).prop('checked')) {
                        if ($(this).parents('.js-check-list-children').length > 0) {
                            var $parentInput = $($(this).parents('.js-check-list-li').find('.js-checkbox')[0]);
                            var $childrenFilter = $children.filter(function (index) {
                                return $(this).prop('checked') == true;
                            });
                            $parentInput.removeClass('indeterminate');
                            if ($childrenFilter.length == $children.length) {
                                $parentInput.prop('checked', true);
                            } else if ($childrenFilter.length > 0) {
                                $parentInput.prop('checked', false);
                                $parentInput.addClass('indeterminate');
                            }
                        } else {
                            $children.prop('checked', true);
                        }
                    } else {
                        if ($(this).parents('.js-check-list-children').length > 0) {
                            var $parentInput = $($(this).parents('.js-check-list-li').find('.js-checkbox')[0]);
                            var $childrenFilter = $children.filter(function (index) {
                                return $(this).prop('checked') == true;
                            });
                            $parentInput.removeClass('indeterminate');
                            if ($childrenFilter.length < $children.length && $childrenFilter.length > 0) {
                                $parentInput.prop('checked', false);
                                $parentInput.addClass('indeterminate');
                            }
                        } else {
                            $children.prop('checked', false);
                        }
                    }
                    $.each($checkbox, function (i, n) {
                        if ($(n).prop('checked')) {
                            checkedArr.push(n);
                        }
                    });
                    console.log(checkedArr.length, $checkbox.length);
                    if (checkedArr.length == $checkbox.length) {
                        $checkList.find('.js-checkbox-all').prop('checked', true);
                    } else {
                        $checkList.find('.js-checkbox-all').prop('checked', false);
                    }
                });

                $('#right-cont').delegate('.js-checkbox-all', 'click', function (event) {
                    if ($(this).prop('checked')) {
                        $(this).parents('.js-check-list').find('.js-checkbox').prop('checked', true);
                    } else {
                        $(this).parents('.js-check-list').find('.js-checkbox').prop('checked', false);
                    }
                    $(this).parents('.js-check-list').find('.indeterminate').removeClass('indeterminate')
                });
                $('#right-cont').delegate('.js-company-count', 'focus', function (event) {
                    $(this).parent().find('.realtime-edit-icon').hide();
                });
                $('#right-cont').delegate('.js-company-count', 'blur', function (event) {
                    $(this).parent().find('.realtime-edit-icon').show();
                    processData(this, 'save');
                });
                $('#right-cont').delegate('.js-contact-count', 'focus', function (event) {
                    $(this).parent().find('.realtime-edit-icon').hide();
                });
                $('#right-cont').delegate('.js-contact-count', 'blur', function (event) {
                    $(this).parent().find('.realtime-edit-icon').show();
                    processData(this, 'save');
                });

                $('#right-cont').delegate('.js-add-segment', 'click', function (event) {
                    var $detailView = $('.js-detailView');
                    if ($detailView.length >= 50) {
                        topAlert.addAlert('error', 'You cannot add more than 3 segments.');
                        return;
                    }
                    $.when(getUserInfo()).then(function (response) {
                        var dtd = $.Deferred();
                        $.when(
                            getInfos(response, 'getDemandGenFilter')
                        ).then(function (getSegment) {
                            var data = {};
                            data.getSegment = getSegment;
                            dtd.resolve(data);

                        });
                        return dtd;
                    }).then(function (data) {
                        console.log(data);
                        var dtd = $.Deferred();
                        segmentRender('add', data, dtd);
                        return dtd;
                    }).then(function (type, $html, data) {
                        afterFilterRender(type, $html, data);
                    });
                });

                $('#right-cont').delegate('.js-remove-segment', 'click', function (event) {
                    var _this = this;
                    var segmentId = $(this).parents('.js-detailView').attr('id');
                    var $detailView = $(this).parents('.js-detailView');
                    if (!segmentId) {
                        $detailView.remove();
                    } else {
                        console.log($detailView.position().top, $detailView.height())
                        $('.js-confirm-window .js-sure').data('segment-id', segmentId);
                        $('.js-confirm-window').css('top', $detailView.position().top + $detailView.height() / 2 - 100);
                        $('.js-confirm-window').show();
                    }


                });
                $('.js-confirm-window').undelegate();
                $('.js-confirm-window').delegate('.js-close', 'click', function () {
                    $('.js-confirm-window').hide();
                });
                $('.js-confirm-window').delegate('.js-sure', 'click', function () {
                    var segmentId = $(this).data('segment-id');
                    var $detailView = $('#' + segmentId);
                    $.when(deleteUserSegment(userInfo, segmentId)).then(function (response) {
                        console.log('Delete', response);

                        $detailView.remove();
                    });
                    $('.js-confirm-window').hide();
                });

                function newWin(url, id) {
                    var a = document.createElement('a');
                    a.setAttribute('href', url);
                    // a.setAttribute('target', '_blank');
                    a.setAttribute('id', id);
                    a.style.display = 'none';
                    if (!document.getElementById(id)) {
                        document.body.appendChild(a);
                    }
                    a.click();
                }

                $('#right-cont').delegate('.js-export-btn', 'click', function (event) {
                    var segmentId = $(this).parents('.js-detailView').attr('id');
                    var $detailView = $('#' + segmentId);
                    if (!segmentId) {
                        topAlert.addAlert('ERROR', 'Please save it first!');
                        return;
                    }
                    var appendContact = false;
                    if ($(this).parent().find('.js-export-drop-list input')[1].checked) {
                        appendContact = true;
                    }
                    var checkedVal = $detailView.find('.js-filter-type:checked').val();
                    var $companyCount = $detailView.find('.js-company-count');
                    var $companiesNum = $detailView.find('.js-companies-num');
                    if(checkedVal == '1'){
                        if(Number($companyCount.val().replace(/\D/g,''))>Number($companiesNum.html().replace(/\D/g,''))){
                            topAlert.addAlert('ERROR',"Please enter a value for # of companies requested that's lower than "+$companiesNum.html()+"!");
                            return;
                        }
                    }else{
                        if(appendContact&&Number($detailView.find('.js-contact-count').val().replace(/\D/g,''))<=0){
                            topAlert.addAlert('ERROR','Contacts/company must be greater than 0 if would like export data "With zoominfo calls"!');
                            return;
                        }
                    };
                    $.ajax({
                        type: 'get', //
                        url: apiLsWeb + 'lg/isRunAs',
                        dataType: 'json',
                        success: function (response) {
                            if (response.status!=200) {
                                return;
                            }
                            if (response.data) {
                                $('.js-confirm-window-export .js-sure').data('segment-id', segmentId);
                                $('.js-confirm-window-export .js-sure').data('segment-appendContact', appendContact);
                                $('.js-confirm-window-export').css('top', $detailView.position().top + $detailView.height() / 2 - 100);
                                $('.js-confirm-window-export').show();

                            } else {
                                newWin(apiLsWeb + 'lg/exportData?&segmentId='+selectedSegment.id+'&filterId=' + segmentId, 'js-new-win');
                            }
                        },
                        error: function () {
                            topAlert.addAlert("ERROR", msg.SYSTEM_BUSY);
                        }
                    })

                });
                $('.js-confirm-window-export').undelegate();
                $('.js-confirm-window-export').delegate('.js-close', 'click', function () {
                    $('.js-confirm-window-export').hide();
                });
                $('.js-confirm-window-export').delegate('.js-sure', 'click', function () {
                    $('.js-confirm-window-export').hide();
                    var segmentId = $(this).data('segment-id');
                    var appendContact = $(this).data('segment-appendContact');
                    topAlert.addAlert("info", "Your request is being processed. We will deliver the results to you via email once the leads are ready.");
                    $.ajax({//TODO
                        type: 'get', //
                        url: apiLsWeb + 'lg/exportData?appendContact=' + appendContact + '&segmentId='+selectedSegment.id+'&filterId=' + segmentId,
                        dataType: 'json',
                        success: function (response) {
                            if (response.status!=200) {
                                topAlert.addAlert("error", response.statusInfo
                                    || jobCommon.AJAX_FAILURE_DEFAULT_MESSAGE);
                                return;
                            }
                        },
                        error: function () {
                        }
                    })
                });

                $('#right-cont').delegate('.js-company-count', 'keyup', function (event) {
                    var val = Number($(this).val().replace(/,/ig, ""));
                    if ($.isNumeric(val)) {
                        val = $filter('number')(val,0);
                    } else {
                        return;
                    }
                    $(this).val(val);
                });
                $('#right-cont').delegate('.js-contact-count', 'keyup', function (event) {
                    var val = Number($(this).val().replace(/,/ig, ""));
                    if ($.isNumeric(val)) {
                        val = $filter('number')(val,0);
                    } else {
                        return;
                    }
                    $(this).val(val);
                });
                $('#right-cont').delegate('.js-segment-name', 'keyup', function (event) {
                    var $span = $('.js-segment-name-span');
                    $span.html($(this).val());
                    if ($(this).val().length > 0) {
                        $(this).css('width', $span.width())
                    } else {
                        $(this).css('width', '220px')
                    }

                });
                $('#right-cont').delegate('.js-company-count-type-list li', 'click', function (event) {
                    processData(this, 'save');
                });

                function processData(o, serverType) {
                    if (!userInfo) {
                        //topAlert.addAlert("ERROR", 'Please log in!');
                        //return;
                    }
                    var data = {};
                    var $detailView = $(o).parents('.js-detailView');
                    var $tab = $detailView.find('.js-filter-list-tab a');
                    var $hasContact = $detailView.find('.js-filter-list-tab .js-checkbox');
                    var hasContact = $hasContact.prop('checked');
                    var $rangeRevenue = $detailView.find('.js-range-revenue');
                    var $rangeCompanySize = $detailView.find('.js-range-company-size');
                    var rangeRevenue = $rangeRevenue.val().split(';');
                    var rangeCompanySize = $rangeCompanySize.val().split(';');
                    var $checkList = $detailView.find('.js-check-list');
                    var $keysContent = $detailView.find('.js-keys-textarea p');
                    var $includeKeys = $($keysContent[0]).find('.js-key-item');
                    var $excludeKeys = $($keysContent[1]).find('.js-key-item');
                    var $companyCount = $detailView.find('.js-company-count');
                    var $contactCount = $detailView.find('.js-contact-count');
                    var $contactsNum = $detailView.find('.js-contacts-num');
                    var $companiesNum = $detailView.find('.js-companies-num');
                    var $frequency = $detailView.find('.js-frequency .js-dropdown-toggle-text');
                    var $tableContent = $detailView.find('.js-table-content');
                    var $exportBtn = $detailView.find('.js-export-btn');
                    var $keySearchdDropdownToggleText = $detailView.find('.js-keySearch-list-input .js-dropdown-toggle-text');
                    var $jsCompanyCountType = $detailView.find('.js-company-count-type');

				setTimeout(function() {
					var checkedVal = $detailView.find('.js-filter-type:checked').val();
                    var keyIndexMap = [
                        ['company', 'industry', 0],
                        ['company', 'state', 1],
                        ['contact', 'function', 3],
                        ['contact', 'level', 2]
                    ];
                    data.name = $detailView.find('.js-segment-name').val();
                    data.userId =selectedSegment.accountId;//userInfo.id;//TODO
                    if ($detailView.attr('id')) {
                        data.id = $detailView.attr('id');
                    }
                    data.company = {
                        industry: {
                            checkedData: []
                        },
                        state: {
                            checkedData: [],
                            checkedDataAndText: [],
                            all: true
                        },
                        revenue: {
                            startValue: revenueValueNum[rangeRevenue[0]] == -1 ? 5 * 1000000000 : revenueValueNum[rangeRevenue[0]],
                            endValue: revenueValueNum[rangeRevenue[1]]
                        },
                        companySize: {
                            startValue: companySizeValueNum[rangeCompanySize[0]] == -1 ? 10000 : companySizeValueNum[rangeCompanySize[0]],
                            endValue: companySizeValueNum[rangeCompanySize[1]]
                        },
                        hasContact: true
                    };
                    data.contact = {
                        title: {
                            included: [],
                            excluded: []
                        },

                        function: {
                            checkedData: [],
                            checkedDataAndText: [],
                            all: true
                        },
                        level: {
                            checkedData: [],
                            checkedDataAndText: [],
                            all: true
                        }
                    };
                    data.company.hasContact = checkedVal == '1' ? false : true;
                    $.each(keyIndexMap, function (l, value) {
                        var $checkboxList = $($checkList[value[2]]).find('.js-checkbox');
                        $.each($checkboxList, function (i, n) {
                            // if($(n).data('ishassub')){
                            var itemData = {};
                            if (value[1] == 'industry') {
                                itemData = {
                                    data: {
                                        id: Number($(n).data('id')),
                                        display: $(n).parent().find('.js-display').html()
                                    },
                                    subItems: [],
                                    all: false
                                };
                            } else {
                                itemData = {
                                    id: Number($(n).data('id')),
                                    display: $(n).parent().find('.js-display').html()
                                };
                            }

                            if ($(n).data('ishassub') == '1') {
                                var $childrenCheckboxList = $(n).parents('.js-check-list-li').find('.js-check-list-children .js-checkbox');
                                $.each($childrenCheckboxList, function (ci, cn) {
                                    if ($(cn).prop('checked')) {
                                        itemData.subItems.push({
                                            id: Number($(cn).data('id')),
                                            display: $(cn).parent().find('.js-display').html()
                                        });
                                    }
                                });
                                if (itemData.subItems.length > 0) {
                                    if (value[1] == 'industry') {
                                        if (itemData.subItems.length == $childrenCheckboxList.length) {
                                            itemData.all = true;
                                        } else {
                                            itemData.all = false;
                                        }

                                        data[value[0]][value[1]].checkedData.push(itemData);
                                    } else {
                                        data[value[0]][value[1]].checkedDataAndText.push(itemData);
                                    }

                                }
                            } else {

                                if ($(n).prop('checked')) {
                                    
                                    if (value[1] == 'industry') {
                                        itemData.all = true;
                                        data[value[0]][value[1]].checkedData.push(itemData);
                                    } else {
                                        data[value[0]][value[1]].checkedDataAndText.push(itemData);
                                    }
                                }
                            }
                            // }else
                            if ($(n).data('issub') != '1' && value[1] != 'industry') {
                                if ($(n).prop('checked')) {
                                    data[value[0]][value[1]].checkedData.push(Number($(n).data('id')));
                                }
                            }

                        });
                        if (data[value[0]][value[1]].all) {
                            if (data[value[0]][value[1]].checkedData.length < $checkboxList.length) {
                                data[value[0]][value[1]].all = false;
                            } else {
                                data[value[0]][value[1]].all = true;
                            }
                        }

                    });
                    // if($keySearchdDropdownToggleText.data('value') == '1'){
                    $.each($includeKeys, function (i, n) {
                        data.contact.title.included.push($(n).find('span').html());
                    });
                    // }else{
                    $.each($excludeKeys, function (i, n) {
                        data.contact.title.excluded.push($(n).find('span').html());
                    });
                    // }

                    // totalContact
                    var tempCount = Number($companyCount.val().replace(/,/ig, ""));
                    var maxCompanyCount = 150000;
                    var maxContactCount = 600000;
                    if ($jsCompanyCountType.data('value') == '1' || checkedVal == '1') {
                        if (tempCount > maxCompanyCount) {
                            topAlert.addAlert('ERROR', 'The maximum number of companies  is ' + $filter('number')(maxCompanyCount,0));
                        }
                        data.companyCount = tempCount > maxCompanyCount ? maxCompanyCount : tempCount;
                        $companyCount.val($filter('number')(data.companyCount,0));
                        data.totalContact = 0;
                    } else {
                        if (tempCount > maxContactCount) {
                            topAlert.addAlert('ERROR', 'The maximum number of contacts  is ' + $filter('number')(maxContactCount,0));
                        }
                        data.companyCount = 0;
                        data.totalContact = tempCount > maxContactCount ? maxContactCount : tempCount;
                        $companyCount.val($filter('number')(data.totalContact,0));
                    }

                    data.contactCount = checkedVal == '1' ? 0 : Number($contactCount.val().replace(/,/ig, ""));
                    data.frequency = Number($frequency.data('value'));
                    console.log(data.companyCount, data.contactCount);
                    if (!$.isNumeric(data.companyCount) || !$.isNumeric(data.totalContact) || !$.isNumeric(data.contactCount) || (data.companyCount <= 0 && data.totalContact <= 0)) {
                        topAlert.addAlert('ERROR', 'Please enter a number greater than zero!');
                        return;
                    };
                    data.segmentId = selectedSegment.id;//TODO
                    console.log('data', data);
                    if (serverType != 'save') {
                        $contactsNum.html('-');
                        $companiesNum.html('-');
                        $detailView.find('.js-tbody-loading').show();
                        $detailView.find('.js-table-content').hide();
                        $detailView.find('.js-page-control').hide();
                        $.when(queryData(data)).then(function (response) {
                            console.log('queryData', response);
                            $detailView.find('.js-tbody-loading').hide();
                            $detailView.find('.js-table-content').show();
                            // $exportBtn.prop('disabled',false);
                            queryCallback(response, $detailView);
                        });
                        $.when(getCompanyCount(data)).then(function (response) {
                            console.log('getCompanyCount', response);

                            $companiesNum.html($filter('number')(response.data,0));
                        });
						if (checkedVal != '1') {
	                        $.when(getContactCount(data)).then(function (response) {
	                            console.log('getContactCount', response);
	                            $contactsNum.html($filter('number')(response.data,0));
	                        });
                    	}

					}
                    $.when(saveSegment(data)).then(function (response) {
                        console.log('saveSegment', response);

                        $detailView.attr('id', response.data);
                    });
                },0);
			};
                function queryCallback(response, $detailView) {
                    var $tableContent = $detailView.find('.js-table-content');
    				var checkedVal = $detailView.find('.js-filter-type:checked').val();
                    var resultText = doT.template($("#resultTpl").text());
					msg.data.checkedVal = checkedVal;
                    var resultHtml = resultText(response.data);
                    $tableContent.html(resultHtml);
                    $detailView.find('.link-pop').popover();
                    $detailView.find('.link-pop').on("click", function (e) {
                        $(this).parent().find(".popover").css("left", $(this).parent().find(".popover").css("left") - 90);
                        $(this).parent().find(".popover").animate({
                            left: '-=70px'
                        });
                        $(this).parent().find(".arrow").css("margin-left", "58px");
                    });

                    var $resultTrList = $detailView.find('.js-result-tr-list');
                    var $pageButton = $detailView.find('.js-page-control button');
                    $.each($resultTrList, function (i, n) {
                        if (i < 5) {
                            $(n).show();
                        }
                    });
                    if ($resultTrList.length > 5) {
                        $($pageButton[0]).show();
                        $($pageButton[1]).hide();
                        $detailView.find('.js-page-control').show();
                        $detailView.find('.js-page-control button').off();
                        $detailView.find('.js-page-control button').on('click', function () {
                            $(this).hide();
                            if ($(this).data('type') == 'next') {
                                $.each($resultTrList, function (i, n) {
                                    if (i < 5) {
                                        $(n).hide();
                                    } else {
                                        $(n).show();
                                    }
                                });
                                $($pageButton[1]).show();
                            } else {
                                $.each($resultTrList, function (i, n) {
                                    if (i < 5) {
                                        $(n).show();
                                    } else {
                                        $(n).hide();
                                    }
                                });
                                $($pageButton[0]).show();
                            }
                        });
                    }

                };

                $('#right-cont').delegate('.js-show-result', 'click', function (event) {
                    processData(this);
                });
                function filterTypeTab(o,type) {
		var $detailView = $(o).parents('.js-detailView');
		var checkedVal = $(o).val();
		var $tab = $detailView.find('.js-filter-list-tab a');
		var $contactTab = $detailView.find('.js-filter-list-tab-contact');
		var $contactsNum = $detailView.find('.js-contacts-num');
		var $contactCount = $detailView.find('.js-contact-count');
		var $contactCountDisabled = $detailView.find('.js-contact-count-disabled');
		var $companyCountType = $detailView.find('.js-company-count-type');
		var $companyCountTypeDisabled = $detailView.find('.js-company-count-type-disabled');
		var $text1 = $detailView.find('.js-export-drop-item-text1');
		var $text2 = $detailView.find('.js-export-drop-item-text2');
		if(checkedVal == '1'){
			$contactTab.addClass('disabled');
			($tab[0]).click();
			$contactsNum.html('--');
			$contactCount.hide();
			$contactCountDisabled.show();
			$companyCountType.parent().hide();
			$companyCountTypeDisabled.parent().show();
			$text1.hide();
			$text2.show();
		}else{
			$contactTab.removeClass('disabled');
			$contactCount.show();
			$contactCountDisabled.hide();
			$companyCountType.parent().show();
			$companyCountTypeDisabled.parent().hide();
			$text1.show();
			$text2.hide();
		};
		if(type != 'add'){
			$detailView.find('.js-show-result').click();
		}

	};
                $('#right-cont').delegate('.js-filter-type','click', function(){
                    filterTypeTab(this);
                });

            })
    }()
);
