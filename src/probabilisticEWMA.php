<?php

if ( !(class_exists('probabilisticEWMA')) ) 
{
	class probabilisticEWMA 
	{
		private $data;
		private $s1;
		private $s2;
	
	
		private $trainingFlag;
		private $arc_alpha;
		private $arcX_t;
		private $presetAlpha;
		private $presetBeta;
	
		
		public function __construct($data, $flag) // seprate the data by subjects
		{
			/**
			 * $flag set to true means we are in training mode
			 */
			$this->data = $data;
			$this->trainingFlag = $flag;
			
			/**
			 * set default values for alpha and beta values here
			 */
			$alpha = 0.98;
			$beta = 0.98;
			$this->setParameters ( $alpha, $beta );
		}
		
		
		public function setParameters($alpha, $beta) 
		{
			$this->presetAlpha = $alpha;
			$this->presetBeta = $beta;
		}
		
		
		public function setStatus($flag) 
		{
			$this->trainingFlag = $flag;
		}
		
		
		public function getStatus() 
		{
			return $this->trainingFlag;
		}
		
		
		public function setData($data) 
		{
			$this->data = $data;
		}
		
		
		public function getData() 
		{
			return $this->data;
		}
		
		public function sd_square($x, $mean) {
			return pow ( $x - $mean, 2 );
		}
		
		// Function to calculate mean
		public function mean($array) {
			// square root of sum of squares devided by N-1
			return (array_sum ( $array ) / count ( $array ));
		}
		
		// Function to calculate standard deviation (uses sd_square)
		public function sd($array) {
			// square root of sum of squares devided by N-1
			return sqrt ( array_sum ( array_map ( "sd_square", $array, array_fill ( 0, count ( $array ), mean ( $array ) ) ) ) / (count ( $array ) - 1) );
		}	
		
		
		public function calcAnomalyScore() 
		{
			$prob_List = array ();
			
			if ($this->trainingFlag) 
			{
				
				for($ind = 1; $ind <= count ( $this->data ); $ind ++) 
				{
					if ($ind == 1)
					{
						//initialize variable
						$this->s1 = $this->data [$ind - 1];
						$this->s2 = pow ( $this->s1, 2 );
						$this->arc_alpha = 1 - (1.0 / ($ind + 0.00001));
					}
// 					$alpha = 1 - (1.0 / ($ind + 0.00001)); // prevent blowing up of variable
					$alpha = 1 - (1.0 / $ind );
					$this->arcX_t = $this->data [$ind - 1];
					$X_t = $this->data [$ind];
					$Z_t = ($X_t - $this->arcX_t) / $this->arc_alpha;
					
					$P_t = (1 / sqrt ( 2 * pi () )) * exp ( -0.5 * pow ( $Z_t, 2 ) );
					$prob_List [] = $P_t; //add to list of probability score
					
					/**
					 * increment the variable
					 */
					
					$this->s1 = ($alpha * $this->s1) + ((1 - $alpha) * $X_t);
					$this->s2 = ($alpha * $this->s2) + ((1 - $alpha) * pow ( $X_t, 2 ));
					
					$this->arcX_t = $this->s1;
					$this->arc_alpha = sqrt ( $this->s2 - pow ( $this->s1, 2 ) );
				}
			} 
			else 
			{
				for($ind = 1; $ind <= count ( $this->data ); $ind ++) 
				{				
					$this->arcX_t = $this->data [$ind - 1];
					$X_t = $this->data [$ind];
					$Z_t = ($X_t - $this->arcX_t) / $this->arc_alpha;
					
					$P_t = (1 / sqrt ( 2 * pi () )) * exp ( - 0.5 * pow ( $Z_t, 2 ) );
					
					$alpha = $this->presetAlpha;
					$beta = $this->presetBeta;
					
					$alpha = (1 - ($beta * $P_t)) * $alpha;
					
					$prob_List [] = $P_t;
					
					/**
					 * increment the variable
					 */
					
					$this->s1 = ($alpha * $this->s1) + ((1 - $alpha) * $X_t);
					$this->s2 = ($alpha * $this->s2) + ((1 - $alpha) * pow ( $X_t, 2 ));
					
					$this->arcX_t = $this->s1;
					$this->arc_alpha = sqrt ( $this->s2 - pow ( $this->s1, 2 ) );
				}
			}
			return $prob_List;
		}
	}
}

// $data = array (2,4,3,8,4,7,3,5,7,5,3,3,5,75,4,4,6,8,5,4 );
// $ewmaObj = new probabilisticEWMA ( $data, true );

// $trainOutput = $ewmaObj->calcAnomalyScore ();

// $ewmaObj->setStatus ( false );
// $data = array (5,7,3,8,4,7,3,5,7,5,13,23,5,75,4,14,6,8,15,4 );
// $ewmaObj->setData ( $data );
// $testOutput = $ewmaObj->calcAnomalyScore ();
// $v = 0;
