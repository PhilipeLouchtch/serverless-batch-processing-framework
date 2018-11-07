prefix="step_"
queues=$(aws sqs list-queues --queue-name-prefix $prefix)
for q in ${queues[@]}
do
  if [ "${q:0:1}" == "\"" ]; then
          x=${q:1:${#q}-3}
          if [ $x != "QueueUrls" ]; then
                  aws sqs delete-queue --queue-url $x
                  echo "Deleted $x"
          fi
  fi
done