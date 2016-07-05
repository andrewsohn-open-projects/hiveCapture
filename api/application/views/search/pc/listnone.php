
		<!-- [D] contents -->
		<div id="content" role="main">
			<div class="spot_area s_search">
				<div class="inner">
					<h3 class="spot_tit">SEARCH</h3>
					<p class="spot_txt">WE TRY NOT TO BECOME A MAN OF SUCCESS,<br>WE TRY TO BECOME A MAN OF VALUE.</p>
				</div>
			</div>
			<div class="search_wrap none">
				<p class="none_txt">"검색 결과가 없습니다. 다른 검색어로 시도해보세요."</p>

				<div class="art_lst">
					<div class="lst_top">
						<h3 class="tit">추천키워드</h3>
					</div>
					<div class="side_key">
					<ul class="key_lst">
					<?php 
						foreach ($keyWordlist as $value) {
							# code...
					?>
					<li><a href="<?= site_url('search'); ?>?keyWord=<?= $value->val ;?>"><?= $value->val ;?></a></li>
					
					<!-- <li class="selected"><a href="#">라이센싱</a></li> -->
					<?php
						}
					?>
					</ul>
					</div>
				</div>

				<div class="srch_bx">
					<?= form_open('search', 'id="list" method="get"'); ?>	
						<fieldset>
							<legend>통합 검색</legend>
							<span  class="inp_srch">
								<label for="ipt_srch" class="blind">검색어 입력</label>
								<input type="text" name="keyWord" id="ipt_srch">
								<button type="submit" class="bn_srch">SEARCH</button>
							</span>
						</fieldset>
					<?= form_close(); ?>
				</div>
			</div>
		</div>
		<!-- //[D] contents -->
