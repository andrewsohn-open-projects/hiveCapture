<!-- [D] contents -->
<div id="content" role="main" class="sg_infocnt">
	<div class="spot_area spot">
		<div class="inner">
			<?php navi_print_navi($rfcl, $rfmt); ?>
			<h2 class="h_tit h_spotlist">Spot List</h2>
			<p class="h_txt">볼거리, 즐길 거리가 풍부한 싱가포르의 필수 여행지<br>기본 정보와 추천 음식점, 갤러리까지<br>한 눈에 미리 방문해 보세요.</p>
		</div>
	</div>
	<div class="alg_wrap _selectbox">
		<ul class="alg_lst pc_view">
		<li class="alg_bx"><a href="<?= site_url('friendly/spot') ?>" class="btn_red cen">전체보기</a></li>
		<li class="alg_bx _selectbox_list">
			<button type="button" class="btn_red al _selectbox_title"><?= $cate_nm; ?></button>
			<!--[D] layer 노출 시 부모 .alg_bx에 .on 추가  -->
			<div class="ly_wrap">
				<ul class="ly_lst">
				<li <?php if(!$cate_no) echo 'class="selected"'?>><a href="#" data-value="<?= site_url('friendly/spot'); ?>">분류 선택하기</a></li>
				<?php foreach($cateList as $key=>$value){?>
					<li <?php fe_print_selected($cate_no,$value->cat_no,2); ?>><a href="#" data-value="<?= site_url('friendly/spot').'?cate='.$value->cat_no; ?>"><?= $value->cat_type_nm ?></a></li>
				<?php }?>
				</ul>
			</div>
		</li>
		</ul>
		<ul class="alg_lst m_view">
		<li class="alg_bx"><a href="<?= site_url('friendly/spot') ?>" class="btn_red cen">전체보기</a></li>
		<li class="alg_bx">
			<select class="sel_sg _triggerSelect" name="selbox">
			<option<?php if(!$cate_no) echo ' selected'?> value="" data-value="<?= site_url('friendly/spot'); ?>">분류 선택하기</option>
			<?php foreach($cateList as $key=>$value){?>
			<option <?php fe_print_selected($cate_no,$value->cat_no,1); ?> value="<?= $value->cat_no ?>" data-value="<?= site_url('friendly/spot').'?cate='.$value->cat_no; ?>"><?= $value->cat_type_nm ?></option>
			<?php }?>
			</select>
		</li>
		</ul>
	</div>
	<div class="spl_wrap">
		<div class="inner">
			<ul class="spot_lst">
			<?php if(count($list)){
			foreach($list as $key=>$value){ 
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
						<img src="<?= $img_url ?>" width="230" height="230" alt="" class="s_img">
						<?php }?>
						<div class="s_cont">
							<strong class="tit"><?= $value->spot_nm ?></strong>
							<p class="txt"><?= $value->desc_title?></p> <!--[D] 4줄 말줄임 -->
						</div>
					</a>
				</div>
			</li>
			<?php 
				}
			}?>
			</ul>
			<?php echo $this->pagination->create_links(); ?>
		</div>
	</div>
</div>
<!-- //[D] contents -->