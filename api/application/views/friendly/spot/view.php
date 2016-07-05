<?php 
$list_url = site_url('friendly/spot');
// beauty_print_r($view);
?>
<!-- [D] contents -->
<div id="content" role="main" class="sg_infocnt">
	<div class="spot_area empt">
		<div class="inner">
			<?php navi_print_navi($rfcl, $rfmt); ?>
		</div>
	</div> 
	<div class="spv_wrap">
		<div class="inner">
			<div class="btn_topwrap"><a href="<?= $list_url ?>" class="btn_sort type3"><div class="in"><span class="sp ico_list"></span> 목록으로</div></a></div>
			<div class="detail_bx _expandedbox">
				<span class="img_wrap">
				<?php 
				$img_st = '';
				if(isset($view->resp_img_nm)){
					$img_url = $data_url .$view->resp_img_path. $view->resp_img_nm;
					$img_st = 'style="background-image:url('.$img_url.')"';

					$ch = curl_init();
				    curl_setopt($ch, CURLOPT_URL, $img_url);
				    curl_setopt($ch, CURLOPT_NOBODY, 1);
				    curl_setopt($ch, CURLOPT_FAILONERROR, 1);
				    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
				    if(curl_exec($ch)===FALSE) $img_st = '';
				}
				?>
					<span class="d_img" <?= $img_st ?>></span>
				</span>
				<div class="de_cnt _overflowed_detailbox">
					<div class="de_inner">
						<div class="de_titbx">
							<h3 class="de_tit"><span class="de_in"><?= $view->spot_en_nm ?></span><?= $view->spot_nm ?></h3>
							<span class="zone">지역 :   <?= $view->area_nm ?> </span>
						</div>
						<p class="de_txt"><?= nl2br($view->description); ?></p>
					</div>					
					<div class="de_btnbx"><button type="button" data-button-text="접기" class="btn_more _expandedbox_button">더보기</button></div>
					<?= fe_print_detail_link($view,'<span class="tx">자세히 보기</span><span class="sp">바로가기</span>'); ?>
				</div>
			</div>
			<?php if(isset($view->eatery_no)){ ?>
			<div class="ard_wrap">
				<h3 class="if_tit">주변 먹거리 스팟</h3>
				<ul class="simp_lst">
				<?php 
				foreach($eatery_arr as $key=>$value){
					$img_url = '';
					if(isset($eatery_img_nm_arr[$key])){
						$img_url = $data_url . $eatery_img_path_arr[$key].$eatery_img_nm_arr[$key];

						$ch = curl_init();
					    curl_setopt($ch, CURLOPT_URL, $img_url);
					    curl_setopt($ch, CURLOPT_NOBODY, 1);
					    curl_setopt($ch, CURLOPT_FAILONERROR, 1);
					    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
					    if(curl_exec($ch)===FALSE) $img_url = '';
					}
				?>
				<li>
					<a href="<?= site_url('friendly/spot/'.$value);?>" class="simp_bx">
						<span class="img_wrap"><?php if(isset($img_url) && $img_url){?>
							<img src="<?= $img_url ?>" width="219" height="219" alt="" class="s_img">
						<?php }?></span>
						<div class="s_cont">
							<strong class="tit"><?= $eatery_nm_arr[$key] ?></strong>
						</div>
					</a>
				</li>
				<?php 
				}
				?>
				</ul>
			</div>
			<?php } ?>
			<div class="insta_wrap">
				<h3 class="if_tit">인스타그램 <span class="sp insta">해시태그</span> <span class="hashtag">#<?= $view->hash_tag; ?></span></h3>
				<a href="https://www.instagram.com/explore/tags/<?= $view->hash_tag; ?>/" target="_blank" class="btn_txtdr">인스타그램 바로가기<span class="sp ico_dr"></span></a>
				<!-- [D] Grid Gallery 요소 -->
				<div id="_grid_gallery"></div>
				<!-- //[D] Grid Gallery 요소 -->

				<!-- [D] Grid Gallery 템플릿 -->
				<script type="text/template" id="_grid_template">
				<% if(list.length <= 0 ){ %>
				<div class="err_bx">
					<strong class="err_st">No Result</strong>
					<p class="err_txt">인스타그램 해시태그 검색 결과가 없습니다.</p>
				</div>
				<% } else { %>
				<ul class="insta_lst2" data-page="<%- page %>">
				<% _.each( list, function( item, index ){ %>
					<li data-item-index="<%- index %>">
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
			</div>

			<?php if(isset($spotBanners) && count($spotBanners)){ ?>
			<div class="ban_wrap">
				<ul class="banner_list pc_view _banner_wrap">
				<?php foreach($spotBanners as $key=>$value){
					$img_url = '';
					if($value->img_nm){
						$img_url = config_item('upload_url').$value->img_path.'/'.$value->img_nm;

						$link_target = '_self';
						if(isset($value->link_target)) $link_target = $value->link_target;
					}
				?>
				<li><a href="<?= $value->url ?>" target="<?= $link_target ?>" data-ga="pcSpotViewBanner" data-type="PC <?= $value->pos_nm ?>"><?php if(isset($img_url) && $img_url){?>
					<img src="<?= $img_url ?>"  alt="<?= $value->ban_nm ?>" onError="this.onerror=null;this.src='<?= $ast_url.$default_banner; ?>';">
				<?php } ?></a></li>
				<?php } ?>
				</ul>
				<ul class="banner_list m_view _banner_wrap">
				<?php foreach($spotBanners as $key=>$value){
					$img_url = '';
					if($value->img_m_nm){
						$img_url = config_item('upload_url').$value->img_m_path.'/'.$value->img_m_nm;

						$link_target = '_self';
						if(isset($value->link_target)) $link_target = $value->link_target;
					}
				?>
                <li><a href="<?= $value->url ?>" target="<?= $link_target ?>" data-ga="mobileSpotViewBanner" data-type="M <?= $value->pos_nm ?>"><?php if(isset($img_url) && $img_url){?>
                	<img src="<?= $img_url ?>"  alt="<?= $value->ban_nm ?>" onError="this.onerror=null;this.src='<?= $ast_url.$default_banner; ?>';">
                <?php } ?></a></li>
                <?php } ?>
                </ul>
			</div>
			<?php } ?>
			<div class="btn_wrap"><a href="<?= $list_url ?>" class="btn_sort type3"><div class="in"><span class="sp ico_list"></span> 목록으로</div></a></div>
		</div>
	</div>
</div>
<!-- //[D] contents -->

<script>
	$(function() {
		var client_id = '<?= $client_id ?>';
		var hashtag = '<?= $view->hash_tag; ?>';

	    singapore.ui.GridGallery.init({
	    	id: '_grid_gallery',
	    	moreButton: false,
	    	mediaUrl: 'https://api.instagram.com/v1/tags/'+hashtag+'/media/recent?client_id='+client_id,
	    	totalUrl: 'https://api.instagram.com/v1/tags/'+hashtag+'?client_id='+client_id,
	    	template: $('#_grid_template').html(),
	    	count: 6		    	
	    });

	    var container = $('body')
		, ban_cont = container.find('._banner_wrap')
		, banners = ban_cont.find('a');

		banners.click(function(e){
			var ct = $(e.currentTarget)
			, cont = ct.parents('._banner_wrap')
			, ga_title = ct.data('type')
			, ga_code = ct.data('ga');

			ga('send', 'event', ga_code, 'click', ga_title);
		});
	});
</script>