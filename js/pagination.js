// 20260702-ch11_form_JS_product_list.html

//global variables
const pageState = {
    productList: [],
    pageSize: 5,
    pageAmount: 0,
    currentPage: 1,
    pid_for_update: "",
    pid_for_delete: ""
};

$(function () {
    // tool script: 清理資料
    const cleanText = (value, defaultValue) => {
        const result = String(value ?? "").trim();
        return result === "" ? defaultValue : result;
    };

    // 取得資料
    const loadData = async (data_source_url) => {
        try {
            const { data } = await axios.get(data_source_url);

            cleanData = data.map(function (element, index) {
                return {
                    pid: element.id,    //for update
                    id: index + 1,        //for render table
                    name: cleanText(element.product_name, "傷心的感覺"),
                    number: element.product_number ?? 1,
                    spec: cleanText(element.product_spec, "全糖正常冰"),
                    size: cleanText(element.product_size, "1000ml"),
                    status: element.product_status ?? false,
                    topping: element.topping ?? ["不加料"],
                    supply_option: cleanText(element.supply_option, "冷熱皆可"),
                    created_time: cleanText(element.created_time, "1999/01/01 00:00:01")
                }
            });

            return cleanData;
        } catch (error) {
            Swal.fire("load data error");
            console.log(error);
            return [];
        } //finally {
        //do nothing
        // };
    };

    // 取出需要的資料
    function getCurrentPageData() {
        let indexStart = 0, indexEnd = 0;

        indexStart = (pageState.currentPage - 1) * pageState.pageSize;
        indexEnd = indexStart + pageState.pageSize;

        return pageState.productList.slice(indexStart, indexEnd);
    };

    // 計算分頁數量，渲染分頁導覽
    function renderPaginationNavbar() {
        let strHTML = `<li class="page-item${pageState.currentPage === 1 ? " disabled" : ""}" data-page="${pageState.currentPage - 1}"><a class="page-link" href="#">上一頁</a></li>`;

        for (let i = 1; i <= pageState.pageAmount; ++i) {
            strHTML += `<li class="page-item${i === pageState.currentPage ? " active" : ""}" data-page="${i}" id="page-${i}"><a class="page-link" href="#">${i}</a></li>`;
        };

        strHTML += `<li class="page-item${pageState.currentPage === pageState.pageAmount ? " disabled" : ""}" data-page="${pageState.currentPage + 1}"><a class="page-link" href="#">下一頁</a></li>`;

        $("#pagination").html(strHTML);
    };

    // 渲染畫面
    const renderTable = pageData => {
        let strHTML = '';
        pageData.forEach(item => {
            strHTML += `<tr>
<th scope="row" class="product-id">${item.id}</th>
<td data-th="產品名稱"><span>${item.name}</span></td>
<td data-th="產品數量"><span class="price">${item.number}</span></td>
<td data-th="產品規格"><span>${item.spec}</span></td>
<td data-th="產品尺寸"><span>${item.size}</span></td>
<td data-th="在售狀態"><span class="${item.status ? 'status-active' : 'status-stop'}">${item.status ? "販售中" : "停止出售"}</span></td>
<td data-th="內容配料"><span>${item.topping.join("、")}</span></td>
<td data-th="供應方式"><span>${item.supply_option}</span></td>
<td data-th="建立時間"><span>${item.created_time}</span></td>
<td data-th="資料操作">
<button class="btn btn-warning btn-sm mt-1 update_btn" data-bs-toggle="modal" data-bs-target="#updateModal"
data-pid="${item.pid}" data-pname="${item.name}" data-pnum="${item.number}" data-pspec="${item.spec}"
data-psize="${item.size}" data-pstatus="${item.status}" data-ptopping="${item.topping}" data-psupply="${item.supply_option}"
data-ptime="${item.created_time}">更新</button>
<button class="btn btn-danger btn-sm mt-1 delete_btn" data-pid="${item.pid}">刪除</button>
</td>
</tr>`;
        });

        $("#productList").html(strHTML);
    };

    // 渲染資料呈現區
    const renderMainPage = () => {
        // 防呆，沒有取得資料或者刪除最後一筆資料時可能會發生。總之將第一頁渲染成空白的表格。
        pageState.pageAmount = Math.max(pageState.pageAmount, 1);
        // 防呆，換頁或刪除資料時可能會發生。不想重複寫，統一在渲染之前判斷處理。
        pageState.currentPage = Math.min(Math.max(pageState.currentPage, 1), pageState.pageAmount);

        renderPaginationNavbar();
        let pageData = getCurrentPageData();
        renderTable(pageData);
    };

    // 重整 pageState
    const resetPageState = () => {
        pageState.pageAmount = Math.ceil(pageState.productList.length / pageState.pageSize);
        pageState.currentPage = 1;
    };

    // 關閉 modal
    const closeUpdateModel = () => {
        let modalElement = document.getElementById("updateModal");
        let modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    };

    // main()
    $(async function () {
        pageState.productList = await loadData("http://localhost:3000/product");

        if (pageState.productList.length === 0) {
            //loadData: Swal.fire("load data error");
            return;
        }

        pageState.pageAmount = Math.ceil(pageState.productList.length / pageState.pageSize);
        renderMainPage();
    });

    // 監聽換頁行為
    $(".pagination").on("click", ".page-item", function () {
        let page = Number($(this).data("page"));

        if (page === 0 || page === pageState.pageAmount + 1) {
            return;
        }

        pageState.currentPage = page;

        renderMainPage();
    });

    // 監聽選擇每頁顯示資料數量
    $("#pageSizeSetting").on("change", function () {
        pageState.pageSize = Number($(this).val());
        resetPageState();
        renderMainPage();
    });

    // 監聽更新按鈕
    $("#productList").on("click", ".update_btn", function () {
        //將 data-* 資料傳遞給 Modal 的欄位內
        pageState.pid_for_update = $(this).data("pid");
        let pname = $(this).data("pname");
        let pnum = Number($(this).data("pnum"));
        let pspec = $(this).data("pspec");
        let psize = $(this).data("psize");
        let pstatus = $(this).data("pstatus");
        let ptopping = $(this).data("ptopping"); // data-* 存的是陣列 .toString() 的字串，例如 "珍珠,波霸"
        let psupply = $(this).data("psupply");   // 字串，例如 "冷飲"

        // 帶入一般欄位
        $("#product_name").val(pname);
        $("#product_number").val(pnum);
        $("#product_spec").val(pspec);
        $("#product_size").val(psize);

        // 處理狀態（checkbox 要用 .prop("checked")，不能用 .val()）
        $("#product_status").prop("checked", pstatus === true || pstatus === "true");
        if (pstatus === true || pstatus === "true") {
            $("#product_status_label").text("目前狀態：上架");
        } else {
            $("#product_status_label").text("目前狀態：下架");
        }

        // 處理配料：先全部取消，再根據 ptopping 字串 split 後逐一打勾
        $(".topping_item").prop("checked", false);
        let ptoppingArray = String(ptopping).split(",");
        ptoppingArray.forEach(function (val) {
            $(".topping_item[value='" + val.trim() + "']").prop("checked", true);
        });

        // 處理供應方式：先全部取消，再用屬性選擇器找到對應 value 的 radio 選取
        $(".supply_option").prop("checked", false);
        $(".supply_option[value='" + psupply + "']").prop("checked", true);

        // 檢查目前資料是否正確，雖然自動帶入的資料應該都是正確的，不過還是要渲染一下 class="is-valid"
        let product_number = Number($("#product_number").val());
        $("#product_number")
            .toggleClass("is-valid", product_number >= 1 && product_number <= 10)
            .toggleClass("is-invalid", product_number > 10);

        let product_spec_len = $("#product_spec").val().trim().length;
        $("#product_spec")
            .toggleClass("is-valid", product_spec_len >= 1 && product_spec_len <= 20)
            .toggleClass("is-invalid", product_spec_len > 20);

        if (psize ?? false) {
            $("#product_size").removeClass("is-invalid").addClass("is-valid");
        }

        let topping_item_number = $(".topping_item:checked").length;
        $("#topping_group")
            .toggleClass("is-valid", topping_item_number > 0)
            .toggleClass("is-invalid", topping_item_number <= 0); //< 0 ??

        if ($(".supply_option:checked").val() != undefined) {
            $("#supply_group").addClass("is-valid").removeClass("is-invalid");
        }
    });

    // 監聽確認更新按鈕，送出更新結果
    $("#update_confirm").on("click", function () {
        // 檢查表單內容，如果有錯誤，使用 sweet alert 顯示錯誤訊息
        if (// product_name 不用檢查，因為現在的版本直接帶入原始名稱，且不允許更改。
            // pstatus 為布林值，不用檢查。
            $("#product_number").hasClass('is-valid') == false
            || $("#product_spec").hasClass('is-valid') == false
            || $("#product_size").hasClass('is-valid') == false
            || $("#topping_group").hasClass('is-valid') == false
            || $("#supply_group").hasClass('is-valid') == false) {
            Swal.fire({
                title: "錯誤",
                text: "輸入資料有誤，請重新確認",
                icon: "error"
            });
            return;
        };

        // 取得表單內容，用 axios update 給 json-server
        let topping_array = [];
        $(".topping_item:checked").each(function () {
            topping_array.push($(this).val());
        });

        let updateData = {
            product_number: Number($("#product_number").val()),
            product_spec: $("#product_spec").val(),
            product_size: $("#product_size").val(),
            product_status: $("#product_status").prop("checked"),
            topping: topping_array,
            supply_option: $(".supply_option:checked").val()
        };

        axios.patch(`http://localhost:3000/product/${pageState.pid_for_update}`, updateData)
            .then(function (response) {
                console.log(response);

                if (response.status == 200) {
                    // 無腦更新，但會回到第一頁
                    // Swal.fire({title: "已更新完成", icon: "success"})
                    // .then((result)  => {
                    //     if (result.isConfirmed)
                    //         location.reload();
                    // });

                    // 精準更新，回到原本的畫面
                    let updatedItem = pageState.productList.find(function (item) { return item.pid == pageState.pid_for_update });

                    if (updatedItem) {
                        // 更新資料
                        updatedItem.number = updateData.product_number;
                        updatedItem.spec = updateData.product_spec;
                        updatedItem.size = updateData.product_size;
                        updatedItem.status = updateData.product_status;
                        updatedItem.topping = topping_array;
                        updatedItem.supply_option = updateData.supply_option;

                        // 重新渲染表格
                        renderMainPage();

                        // 關閉 modal
                        closeUpdateModel();
                    }
                    else {
                        console.log("doesn't find updatedItem");
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    // 監聽 Modal 內的欄位是否合理：產品數量
    $("#product_number").on("input", function () {
        let product_number = Number($(this).val());

        $(this)
            .toggleClass("is-valid", product_number >= 1 && product_number <= 10)
            .toggleClass("is-invalid", product_number > 10);
    });

    // 監聽 Modal 內的欄位是否合理：產品規格
    $("#product_spec").on("input", function () {
        let product_spec_len = $(this).val().trim().length;

        $(this)
            .toggleClass("is-valid", product_spec_len >= 1 && product_spec_len <= 20)
            .toggleClass("is-invalid", product_spec_len > 20);
    });

    // 監聽 Modal 內的欄位是否合理：產品尺寸
    // 原本就有帶入資料，必定有已選項，所以不做判斷
    // $("#product_size").on("change", function () {
    //     $(this).removeClass("is-invalid");
    //     $(this).addClass("is-valid"); //非必要
    // });

    // 監聽 Modal 內的欄位的資料表示：產品狀態
    $("#product_status").on("change", function () {
        let product_status = $(this).prop("checked");

        if (product_status) {
            $("#product_status_label").text("目前狀態：上架");
        }
        else {
            $("#product_status_label").text("目前狀態：下架");
        }
    });

    // 監聽 Modal 內的欄位是否合理：產品配料
    $(".topping_item").on("change", function () {
        // 判斷是否有選擇配料
        let topping_item_number = $(".topping_item:checked").length;

        $("#topping_group")
            .toggleClass("is-valid", topping_item_number > 0)
            .toggleClass("is-invalid", topping_item_number <= 0); //< 0 ??

        // 特殊處理：不加料時取消其他選項，選擇其他選項時取消不加料
        if ($(this).prop("checked")) {
            if ($(this).val() == "不加料") {
                // 取消其他加料
                $(".topping_item:checked").each(function () {
                    if ($(this).val() != "不加料") {
                        $(this).prop("checked", false);
                    };
                });
            } else {
                // 取消不加料
                $(".topping_item:checked").each(function () {
                    if ($(this).val() == "不加料") {
                        $(this).prop("checked", false);
                    };
                });
            }
        }
    });

    // 監聽 Modal 內的欄位是否合理：供應選項
    $(".supply_option").on("change", function () {
        if ($(".supply_option:checked").val() != undefined) {
            $("#supply_group").addClass("is-valid").removeClass("is-invalid");
        }
        //radio 不可能再被一般操作取消，不做 invalid 處理
    });

    // 監聽刪除按鈕
    $("#productList").on("click", ".delete_btn", function () {
        // console.log($(this).data("pid"));
        Swal.fire({
            title: "確認刪除？",
            showDenyButton: true,
            confirmButtonText: "確認",
            denyButtonText: "取消"
        }).then((result) => {
            if (result.isDenied) { return; }

            // 沒有取消，傳遞至後端 API 進行刪除
            let deletePid = $(this).data("pid");
            axios.delete(`http://localhost:3000/product/${deletePid}`)
                .then(function (response) {
                    // console.log(response);
                    if (response.status == 200) {
                        // 無腦更新，回到第一頁
                        // location.reload();

                        // 不重新取得後端資料，使用 filter() 過濾的功能，篩選出沒有被刪除的資料，再重新 render table
                        pageState.productList = pageState.productList.filter(function (item) {
                            return item.pid != deletePid;
                        })

                        // 重新產生表格內的編號
                        pageState.productList.forEach(function (item, index) {
                            item.id = index + 1;
                        });

                        // 重新計算總頁數
                        pageState.pageAmount = Math.ceil(pageState.productList.length / pageState.pageSize);

                        // 重新渲染表格內容
                        renderMainPage();
                    }
                }).catch(function (error) {
                    console.log(error);
                });
        });
    });
});