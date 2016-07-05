<style type="text/css">
	.csv_table {width: 100%; border: 1px solid red; border-spacing: 0; border-collapse: collapse;}
	.csv_table th{ border: 1px solid #999;background-color:#222;color:#fff;}
	.csv_table td{ border: 1px solid #999;font-size:12px;}
	.csv_table td.num{ text-align: center;}
	.csv_table td.url{ padding:3px 0 2px 10px;}
	.img_wrap .img_view { position:relative;overflow: hidden; height: 500px;border: 1px solid red; }
	.img_wrap .img_list { position:absolute;left:0;top:0;list-style: none;padding: 0;height: 100%;min-width:100% }
	.img_wrap .img_list li { float:left;width:983px;height: 100%;background-color: #000; text-align:center;border:1px solid blue}
	.img_wrap .img_list li img { max-width: 100%;max-height: 100%; }
	/* 
	JS 
	.img_wrap .img_list li : width 값
	.img_wrap .img_list : left 값 + width 값(이미지 가로 총합)
	 */
</style>
<!-- [D] contents -->
<div id="intro" role="main">
	<div class="logo">
		<h1>Screen Capture</h1>
		<p>developed by UXD BXD Samsung Opt</p>	
	</div>
	<div class="spl_wrap">
		<div class="inner">
			<button id="csvDnldBtn" type="button">CSV 템플릿 다운로드</button>
			<button id="csvInsrtBtn" type="button">CSV 첨부</button>
			<input name="csv" class="_csvFile" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display: none;" />
			
			<script class="csvListTmpl" type="text/x-jquery-tmpl">
				{{if !window.sc.ui.Util.isArray(data) || !data.length}}
				<tr><td colspan="3">수집된 URL이 없습니다.</td></tr>
				{{else}}
				{{each(i, value) data}}
				<tr>
					<td class="num">${value.no}</td>
					<td class="url"><a href="${value.url}" target="_blank">${value.url}</a></td>
					<td class="btn"><button class="removeBtn" type="button">-</button></td>
				</tr>
				{{/each}}
				{{/if}}
			</script>
			<div>
				<table class="csv_table" style="display: none;">
					<colgroup>
						<col style="width: 10%"/>
						<col style="width: 80%"/>
						<col style="width: 10%"/>
					</colgroup>
					<thead>
						<tr>
							<th scope="col">No.</th><th scope="col">URL</th><th scope="col"></th>
						</tr>
					</thead>
					<tbody class="csvList"></tbody>
				</table>
			</div>
		</div>
	</div>
	<div class="ctrl_wrap">
		<?= form_open('scAction', 'name="sForm" style="display:none;"'); ?>
			<input type="hidden" name="urls">
			<button type="submit" class="btn_submit">일괄 화면 캡처</button>
		<?= form_close(); ?>
	</div>
	<div class="img_cont" style="/*display: none;*/">
		<h2>캡처 이미지</h2>
		<div class="img_wrap">
			<div class="img_view">
				<ul class="img_list" style="width: 10000px;">
					<li><img alt="naver" src="http://qa.hivelab.co.kr:4000/samsung/data/www.naver.com3732914464_1024_768.jpg"></li>
					<li><img alt="daum" src="http://qa.hivelab.co.kr:4000/samsung/data/temp.jpg"></li>
					<li><img alt="daum" src="http://qa.hivelab.co.kr:4000/samsung/data/www.daum.net3245335473_1024_768.jpg"></li>
				</ul>
			</div>
			<button type="button" class="btn_pre">prev</button>
			<button type="button" class="btn_next">next</button>
			
			<div>
				<button type="button" class="">이미지 다운로드</button>
				<button type="button" class="" style="/*display: none;*/">Zip 파일 다운로드</button>
			</div>
		</div>
	</div>
</div>
<!-- //[D] contents -->

<script>
(function($, win) {
	$(function() {
        var container = $('body');

        sc.ui.Entry.init(container, {
        	getCapturedImg : '<?= site_url("scAction") ?>'
		});
	});
})(jQuery, window);
</script>