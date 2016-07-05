
<div class="visual _visual">
	<div class="bg_visual pc_view _video_wrap" data-src="tuJ7j3Ntu6E">
		<div id="mainVideoPlayer"></div>
	</div>				
	<ul class="visual_lst m_view _slick_visual">
		<li class="active" style="background-image:url(<?= $ast_url; ?>/img/visual_1280x520_1.jpg)"></li>
		<li style="z-index:-1;background-image:url(<?= $ast_url; ?>/img/visual_1280x520_2.jpg)"></li>
		<li style="z-index:-2;background-image:url(<?= $ast_url; ?>/img/visual_1280x520_3.jpg)"></li>
		<li style="z-index:-3;background-image:url(<?= $ast_url; ?>/img/visual_1280x520_4.jpg);background-position:50% 0"></li>
	</ul>
</div>
<!-- [D] contents -->
<div id="content" role="main">
	<div class="fd_sing">
		<div class="inner">
			<?php navi_print_navi($rfcl, $rfmt);?>
			<h2 class="h_tit h_welcome">Welcome to Singapore!</h2>
			<p class="h_txt">
				고층 건물과 정원으로 가득 찬 풍경과 함께 세계적인 수준의 생활 환경을 자랑하는 활기찬 국제도시, 싱가포르!<br>
				천의 얼굴 싱가포르를 만나보세요.
			</p>
			<a href="<?= site_url('friendly/aboutSingapore')?>" class="btn_sort type1"><div class="in">자세히보기 <span class="sp ico_arr_w"></span></div></a>
			<div class="flag_info">
				<img src="<?= $ast_url; ?>/img/img_flag.jpg" alt="singapore flag">
				<span class="txt">싱가포르 <span>(Singapore)</span></span>
			</div>
			<ul class="info_lst">
			<li>
				<img src="<?= $ast_url; ?>/img/img_info.png" height="156" alt="">
				<p class="txt">비행 거리 : 4,627km, 6시간 10분 비행<br>시간 차이 : 한국보다 1시간 느림</p>
			</li>
			<li>
				<img src="<?= $ast_url; ?>/img/img_info2.png" height="156" alt="">
				<p class="txt">통화 : 싱가포르달러 (SGD 또는 S$) 사용<br>환율 : SGD1은 약 830원 (2016년 1월 기준)</p>
			</li>
			<li>
				<img src="<?= $ast_url; ?>/img/img_info3.png" height="156" alt="">
				<p class="txt">인구 : 약 556만명   |   면적 : 약 697제곱 킬로미터<br>GDP : 2,837억 달러 (2013 IMF 기준)</p>
			</li>
			</ul>
		</div>
	</div>
	<div class="spot_area">
		<div class="inner">
			<h2 class="h_tit h_spot">HOT SPOT</h2>
			<p class="h_txt">
				화려한 도시와 자연이 공존하여 다양한 볼거리가 가득한 싱가포르,
				싱가포르 관광 명소 곳곳을 둘러보며
				다양한 볼거리와 즐길 거리로 유쾌한 시간을 가져보세요.
			</p>
			<ul class="spot_lst">
			<?php if(count($spotlist)){
				foreach($spotlist as $key=>$value){
					$img_url = '';
					if(isset($value->resp_img_nm)){
						$img_url = $data_url .$value->resp_img_path. $value->resp_img_nm;
						$ch = curl_init();
					    curl_setopt($ch, CURLOPT_URL, $img_url);
					    curl_setopt($ch, CURLOPT_NOBODY, 1);
					    curl_setopt($ch, CURLOPT_FAILONERROR, 1);
					    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
					    if(curl_exec($ch)===FALSE) $img_url = '';
					}
				?>
			<li>
				<div class="spot_box">
					<a href="<?= site_url('friendly/spot/'.$value->spot_no);?>"><?php if(isset($img_url) && $img_url){?>
						<img src="<?= $img_url ?>" width="230" height="230" alt="" class="s_img"><?php }?>
						<div class="s_cont">
							<strong class="tit"><?= $value->spot_nm ?></strong>
							<p class="txt">센토사의 중심에 위치한 웨이브 하우스 센토사에서 10피트 높이의 플로우배럴 파도를 타고 마음껏 서핑을 즐겨보세요.</p>
						</div>
					</a>
				</div>
			</li>
			<?php 
				}
			}?>
			</ul>
			<a href="<?= site_url('friendly/spot');?>" class="btn_wide type1"><div class="in">자세히 보기 <span class="sp ico_arr_w"></span></div></a>
		</div>
	</div>
	<div class="gallery_area">
		<div class="inner">
			<h2 class="h_tit h_gallery">Gallery</h2>
			<p class="h_txt">
				지금 이 시각, 인스타그램에서 세계인이 마주하는<br>
				싱가포르의 다양한 모습들을 사진으로 만나보세요.<br>
				인스타그램 <span class="sp">해시태그</span><span class="insta">#yoursingapore</span>
			</p>

			<div id="_grid_gallery"></div>
			<!-- [D] Grid Gallery 더보기 요소 -->
			<a href="#" id="_grid_more" class="btn_wide type2"><div class="in">더 보기 <span class="sp ico_plus"></span></div></a>
			<!-- // [D] Grid Gallery 더보기 요소 -->

			<!-- [D] Grid Gallery 템플릿 -->
			<script type="text/template" id="_grid_template">
			<% if(list.length <= 0 ){ %>
			<div class="err_bx type2">
				<strong class="err_st">No Result</strong>
				<p class="err_txt">인스타그램 해시태그 검색 결과가 없습니다.</p>
			</div>
			<% } else { %>
			<ul class="insta_lst" data-page="<%- page %>">
			<% _.each( list, function( item, index ){ %>
			    <li class="<%- 'sq_b' + (index+1) %>" data-item-index="<%- index %>">
			        <% if ( item.image.url ){ %>
			        	<a href="<%- item.link %>" target="_blank" class="in_box">
			        		<img src="<%- item.image.url %>" alt="<%- item.alt %>">
					        <% if ( item.type === 'video' ){ %>
					        	<span class="grid_icon_video">영상재생 아이콘</span>
					        <% }%>
			        	</a>
			        <% } else { %>        	
			            <span>이미지 없음</span>
			        <% } %>
			    </li>
			<% }); %>
			</ul>
			<% } %>
			</script>
			<!-- // [D] Grid Gallery 템플릿 -->

			<!-- [D] Grid Gallery error 템플릿 -->
			<script type="text/template" id="_grid_error_template">
			<div class="err_bx type2">
				<strong class="err_st">ERROR</strong>
				<p class="err_txt">지금은 일시적으로 인스타그램 연동에 장애가 있습니다.<br>잠시 후 다시 시도해주세요.</p>
			</div>
			</script>
			<!-- // [D] Grid Gallery error 템플릿 -->
		</div>
	</div>
</div>
<!-- //[D] contents -->

<script src="<?= $ast_url; ?>/js/singapore.friendliness.main.js"></script>
<script>
// tagname = 싱가포르
// mediaUrl : https://api.instagram.com/v1/tags/싱가포르/media/recent
// totalUrl : https://api.instagram.com/v1/tags/싱가포르

	$(function() { 
		var client_id = '<?= $client_id ?>';

	    singapore.ui.GridGallery.init({
	    	id: '_grid_gallery',
	    	moreButtonId: '_grid_more', 
	    	mediaUrl: 'https://api.instagram.com/v1/tags/yoursingapore/media/recent?client_id='+client_id,
	    	totalUrl: 'https://api.instagram.com/v1/tags/yoursingapore?client_id='+client_id,
	    	count: 9, 
	    	template: $('#_grid_template').html(),
	    	errorTemplate: $('#_grid_error_template').html(),
	    	adjustRemainder: true		    	
	    });
	});
</script>